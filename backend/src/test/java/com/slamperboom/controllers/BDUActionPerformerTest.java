package com.slamperboom.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.backend.DTO.ExportPayload;
import com.slamperboom.backend.DTO.UpdatePayload;
import com.slamperboom.backend.FrontendAction;
import com.slamperboom.bdui.BDUActionPerformer;
import com.slamperboom.bdui.DialogBuilders;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.settings.DynamicSettings;
import com.slamperboom.testutil.FileSystemIsolationExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link BDUActionPerformer}. {@link IResumeManager} is mocked so no real
 * files are touched; {@link DialogBuilders} is used for real since it is a small pure JSON
 * builder with no side effects, which lets us assert on the actual dialog content produced.
 * <p>
 * {@link FileSystemIsolationExtension} is applied because some actions (change locale,
 * exit) go through the real {@link DynamicSettings} singleton, which persists to
 * "config/config.json" on disk.
 */
@ExtendWith(MockitoExtension.class)
@ExtendWith(FileSystemIsolationExtension.class)
class BDUActionPerformerTest {

    @Mock
    private IResumeManager resumeManager;

    @Mock
    private IResume resume;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final DialogBuilders dialogBuilders = new DialogBuilders();

    private BDUActionPerformer performer;

    @BeforeEach
    void setUp() {
        performer = new BDUActionPerformer(resumeManager, objectMapper, dialogBuilders);
        // Locale is process-wide (static) state inside DynamicSettings; pin it so translation
        // based assertions below don't depend on test execution order.
        DynamicSettings.getInstance().setLocale("en");
    }

    @Test
    void performCreateNew_success_returnsOpenEditScreenWithNewResumeId() throws UserException {
        when(resumeManager.createResume(anyString())).thenReturn("new-resume-id");

        JsonNode result = performer.performCreateNew();

        assertEquals(FrontendAction.OPEN_EDIT_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
        assertEquals("new-resume-id", result.get(BackendConstants.PAYLOAD_KEY).get(BackendConstants.RESUME_ID_KEY).asText());
    }

    @Test
    void performCreateNew_whenManagerThrows_returnsMessageDialog() throws UserException {
        when(resumeManager.createResume(anyString())).thenThrow(new UserException(ErrorCode.RESUME_SAVE_ERROR));

        JsonNode result = performer.performCreateNew();

        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
        verify(resumeManager, never()).saveResume(anyString());
    }

    @Test
    void performLoad_returnsOpenEditScreenForGivenResumeId() {
        JsonNode result = performer.performLoad("some-id");

        assertEquals(FrontendAction.OPEN_EDIT_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
        assertEquals("some-id", result.get(BackendConstants.PAYLOAD_KEY).get(BackendConstants.RESUME_ID_KEY).asText());
    }

    @Test
    void performOpenMainScreen_savesResumeAndReturnsOpenMainScreen() throws UserException {
        JsonNode result = performer.performOpenMainScreen("id-1");

        verify(resumeManager).saveResume("id-1");
        assertEquals(FrontendAction.OPEN_MAIN_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performOpenMainScreen_whenSaveThrows_returnsMessageDialog() throws UserException {
        doThrow(new UserException(ErrorCode.RESUME_SAVE_ERROR)).when(resumeManager).saveResume("id-1");

        JsonNode result = performer.performOpenMainScreen("id-1");

        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performUpdate_updatesInfoAndAllContentBlocks_thenSaves() throws Exception {
        when(resumeManager.getResume("id-1")).thenReturn(resume);
        UpdatePayload payload = buildUpdatePayload();

        JsonNode result = performer.performUpdate(payload);

        verify(resume).updateResumeInformation(any());
        verify(resumeManager).saveResume("id-1");
        assertEquals(FrontendAction.UPDATE_CURRENT_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());

        ArgumentCaptor<ContentType> typeCaptor = ArgumentCaptor.forClass(ContentType.class);
        verify(resume, times(2)).updateContent(typeCaptor.capture(), any());
        // UpdatePayload.Content only has @Getter (no @JsonProperty/setter) on its fields - if
        // Jackson cannot populate them on deserialization, both captured values will be null
        // instead of ABOUT/SKILLS. See review notes on UpdatePayload.Content.
        assertEquals(List.of(ContentType.ABOUT, ContentType.SKILLS), typeCaptor.getAllValues(),
                "UpdatePayload.Content.block did not deserialize correctly - see review notes");
    }

    @Test
    void performUpdate_withNullResumeInfo_doesNotCallUpdateResumeInformation() throws Exception {
        when(resumeManager.getResume("id-1")).thenReturn(resume);
        UpdatePayload payload = objectMapper.treeToValue(
                objectMapper.readTree("{\"resume_id\":\"id-1\",\"content\":[]}"), UpdatePayload.class);

        performer.performUpdate(payload);

        verify(resume, never()).updateResumeInformation(any());
    }

    @Test
    void performUpdate_whenContentUpdateThrows_returnsMessageDialogAndSkipsSave() throws Exception {
        when(resumeManager.getResume("id-1")).thenReturn(resume);
        doThrow(new UserException(ErrorCode.UNABLE_TO_UPDATE_RESUME_BLOCK)).when(resume).updateContent(any(), any());
        UpdatePayload payload = buildUpdatePayload();

        JsonNode result = performer.performUpdate(payload);

        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
        verify(resumeManager, never()).saveResume(anyString());
    }

    @Test
    void performDelete_buildsConfirmationDialogContainingResumeName() {
        when(resumeManager.getResume("id-1")).thenReturn(resume);
        when(resume.getName()).thenReturn("My CV");

        JsonNode result = performer.performDelete("id-1");

        assertEquals(FrontendAction.SHOW_CONFIRMATION.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
        assertTrue(result.get(BackendConstants.PAYLOAD_KEY).get("title").asText().contains("My CV"));
        assertEquals("confirm_delete", result.get(BackendConstants.PAYLOAD_KEY).get("confirm_action").asText());
        assertEquals("id-1", result.get(BackendConstants.PAYLOAD_KEY).get("confirm_action_payload").get(BackendConstants.RESUME_ID_KEY).asText());
    }

    @Test
    void performDelete_whenResumeDoesNotExist_currentlyThrowsNullPointerException() {
        // Documents existing behaviour: getResume() can return null for an unknown id, and
        // performDelete() does not guard against it (see review notes). If this is fixed to
        // return a graceful error dialog instead, update this test accordingly.
        when(resumeManager.getResume("missing-id")).thenReturn(null);
        JsonNode result = performer.performDelete("missing-id");
        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performConfirmDelete_deletesResumeAndReturnsOpenMainScreen() throws UserException {
        JsonNode result = performer.performConfirmDelete("id-1");

        verify(resumeManager).deleteResume("id-1");
        assertEquals(FrontendAction.OPEN_MAIN_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performConfirmDelete_whenManagerThrows_returnsMessageDialog() throws UserException {
        doThrow(new UserException(ErrorCode.UNABLE_TO_DELETE_RESUME)).when(resumeManager).deleteResume("id-1");

        JsonNode result = performer.performConfirmDelete("id-1");

        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performDuplicate_success_returnsOpenMainScreen() throws UserException {
        when(resumeManager.duplicateResume("id-1")).thenReturn("id-2");

        JsonNode result = performer.performDuplicate("id-1");

        assertEquals(FrontendAction.OPEN_MAIN_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performDuplicate_whenManagerThrows_returnsMessageDialog() throws UserException {
        when(resumeManager.duplicateResume("id-1")).thenThrow(new UserException(ErrorCode.RESUME_NOT_FOUND));

        JsonNode result = performer.performDuplicate("id-1");

        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performExport_success_returnsConfirmationDialogToOpenFolder() throws Exception {
        ExportPayload payload = objectMapper.treeToValue(
                objectMapper.readTree("{\"resume_id\":\"id-1\",\"save_path\":\"" + escapedTempPath() + "\"}"),
                ExportPayload.class);

        Optional<JsonNode> result = performer.performExport(payload);

        verify(resumeManager).exportResumeToPDF(eq("id-1"), anyString());
        assertTrue(result.isPresent());
        assertEquals(FrontendAction.SHOW_CONFIRMATION.toString(), result.get().get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performExport_whenManagerThrows_returnsMessageDialog() throws Exception {
        ExportPayload payload = objectMapper.treeToValue(
                objectMapper.readTree("{\"resume_id\":\"id-1\",\"save_path\":\"" + escapedTempPath() + "\"}"),
                ExportPayload.class);
        doThrow(new UserException(ErrorCode.UNABLE_TO_SAVE_PDF)).when(resumeManager).exportResumeToPDF(anyString(), anyString());

        Optional<JsonNode> result = performer.performExport(payload);

        assertTrue(result.isPresent());
        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get().get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performImport_success_returnsOpenEditScreen() throws UserException {
        when(resumeManager.importResumeFromFile("file.json")).thenReturn("imported-id");

        JsonNode result = performer.performImport("file.json");

        assertEquals(FrontendAction.OPEN_EDIT_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
        assertEquals("imported-id", result.get(BackendConstants.PAYLOAD_KEY).get(BackendConstants.RESUME_ID_KEY).asText());
    }

    @Test
    void performImport_whenManagerThrows_returnsMessageDialog() throws UserException {
        when(resumeManager.importResumeFromFile("bad.json")).thenThrow(new UserException(ErrorCode.UNABLE_TO_SAVE_PDF));

        JsonNode result = performer.performImport("bad.json");

        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performChangeLocale_updatesLocaleAndReturnsUpdateCurrentScreen() {
        JsonNode result = performer.performChangeLocale("ru");

        assertEquals("ru", DynamicSettings.getInstance().getLocale());
        assertEquals(FrontendAction.UPDATE_CURRENT_SCREEN.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performGetLocales_returnsLocaleDialogAction() {
        JsonNode result = performer.performGetLocales();

        assertEquals(FrontendAction.LOCALE_DIALOG.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performOpenAbout_returnsOpenAboutAction() {
        JsonNode result = performer.performOpenAbout();

        assertEquals(FrontendAction.OPEN_ABOUT.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performExit_savesAllResumesAndSettings_returnsClose() throws UserException {
        JsonNode result = performer.performExit();

        verify(resumeManager).saveAll();
        assertEquals(FrontendAction.CLOSE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    @Test
    void performExit_whenSaveAllThrows_returnsMessageDialog() throws UserException {
        doThrow(new UserException(ErrorCode.RESUME_SAVE_ERROR)).when(resumeManager).saveAll();

        JsonNode result = performer.performExit();

        assertEquals(FrontendAction.SHOW_MESSAGE.toString(), result.get(BackendConstants.FRONTEND_ACTION_KEY).asText());
    }

    private UpdatePayload buildUpdatePayload() throws Exception {
        String json = "{\"resume_id\":\"id-1\",\"resume_info\":{\"resume_name\":\"n\",\"template_name\":\"t\",\"resume_locale\":\"en\"}," +
                "\"content\":[{\"block\":\"ABOUT\",\"payload\":{}},{\"block\":\"SKILLS\",\"payload\":{}}]}";
        return objectMapper.readValue(json, UpdatePayload.class);
    }

    private String escapedTempPath() {
        return (System.getProperty("java.io.tmpdir") + "/export-test.pdf").replace("\\", "\\\\");
    }
}
