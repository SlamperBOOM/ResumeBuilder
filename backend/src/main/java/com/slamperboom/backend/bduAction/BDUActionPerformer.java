package com.slamperboom.backend.bduAction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.backend.DTO.ConfirmationDialogPayload;
import com.slamperboom.backend.DTO.ExportPayload;
import com.slamperboom.backend.DTO.UpdatePayload;
import com.slamperboom.bdui.DialogBuilders;
import com.slamperboom.backend.FrontendAction;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.settings.DynamicSettings;
import com.slamperboom.settings.Settings;
import com.slamperboom.translations.TranslationsManager;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.util.Optional;

@RequiredArgsConstructor
public class BDUActionPerformer {
    private final Logger logger = Logger.getLogger(this.getClass());

    private final IResumeManager resumeManager;
    private final ObjectMapper objectMapper;
    private final DialogBuilders dialogBuilders;

    public JsonNode performCreateNew() {
        try {
            String resumeName = Settings.getInstance().getDefaultNewResumeName();
            String resumeId = resumeManager.createResume(resumeName);
            return objectMapper.createObjectNode()
                    .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_EDIT_SCREEN.toString())
                    .set(BackendConstants.PAYLOAD_KEY, objectMapper.createObjectNode().put(BackendConstants.RESUME_ID_KEY, resumeId));
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performLoad(String resumeId) {
        logger.infof("Loading resume with id %s", resumeId);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_EDIT_SCREEN.toString())
                .set(BackendConstants.PAYLOAD_KEY, objectMapper.createObjectNode().put(BackendConstants.RESUME_ID_KEY, resumeId));
    }

    public JsonNode performOpenMainScreen(String resumeId) {
        try {
            resumeManager.saveResume(resumeId);
            return objectMapper.createObjectNode()
                    .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performUpdate(UpdatePayload payload) {
        try {
            String resumeId = payload.getResumeId();
            IResume resume = resumeManager.getResume(resumeId);
            if (payload.getResumeInfo() != null) {
                resume.updateResumeInformation(payload.getResumeInfo());
            }
            for (UpdatePayload.Content block : payload.getContent()) {
                resume.updateContent(block.getBlock(), block.getPayload());
            }
            resumeManager.saveResume(resumeId);
            logger.infof("Updated resume with id %s", resumeId);
            logger.debugf("Update payload: ", payload);
            return objectMapper.createObjectNode()
                    .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.UPDATE_CURRENT_SCREEN.toString());
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performDelete(String resumeId) {
        ConfirmationDialogPayload payload = new ConfirmationDialogPayload();
        JsonNode translations = TranslationsManager.getInstance().getConfirmationDialogTranslations();

        payload.setTitle(translations.get("delete_confirmation.title").asText() + resumeManager.getResume(resumeId).getName());
        payload.setText(translations.get("delete_confirmation.text").asText());
        payload.setConfirmButtonText(translations.get("delete_confirmation.confirm_button_text").asText());
        payload.setDeclineButtonText(translations.get("delete_confirmation.decline_button_text").asText());
        payload.setConfirmAction("confirm_delete");
        payload.setConfirmActionPayload(objectMapper.createObjectNode().put(BackendConstants.RESUME_ID_KEY, resumeId));

        return dialogBuilders.buildConfirmationDialog(payload);
    }

    public JsonNode performConfirmDelete(String resumeId) {
        try {
            resumeManager.deleteResume(resumeId);
            logger.infof("Deleting resume with id %s", resumeId);
            return objectMapper.createObjectNode()
                    .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performDuplicate(String resumeId) {
        try {
            String newResumeId = resumeManager.duplicateResume(resumeId);
            logger.infof("Duplicating resume with id %s. New resume id: %s", resumeId, newResumeId);
            return objectMapper.createObjectNode()
                    .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public Optional<JsonNode> performExport(ExportPayload payload) {
        try {
            resumeManager.exportResumeToPDF(payload.getResumeId(), payload.getSavePath());
            logger.infof("Exporting resume with id %s to PDF. PDF file located at %s", payload.getResumeId(), payload.getSavePath());
        } catch (UserException e) {
            return Optional.of(dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage()));
        }
        ConfirmationDialogPayload confirmPayload = new ConfirmationDialogPayload();
        JsonNode translations = TranslationsManager.getInstance().getConfirmationDialogTranslations();

        confirmPayload.setTitle(translations.get("after_export_confirmation.title").asText());
        confirmPayload.setText(translations.get("after_export_confirmation.text").asText());
        confirmPayload.setConfirmButtonText(translations.get("after_export_confirmation.confirm_button_text").asText());
        confirmPayload.setDeclineButtonText(translations.get("after_export_confirmation.decline_button_text").asText());
        confirmPayload.setConfirmAction("open_local_dir");
        confirmPayload.setConfirmActionPayload(
                objectMapper.createObjectNode().put(
                        "local_dir_path",
                        new File(payload.getSavePath()).getParentFile().getAbsolutePath()
                ));

        return Optional.of(dialogBuilders.buildConfirmationDialog(confirmPayload));
    }

    public void performOpenSaveDir() {
        performOpenDir(resumeManager.getSaveFolderPath());
    }

    public Optional<JsonNode> performOpenDir(String dirPath) {
        try {
            Desktop.getDesktop().open(new File(dirPath));
            logger.info("Open resume dir");
            return Optional.empty();
        } catch (IOException e) {
            return Optional.of(dialogBuilders.buildMessageDialogWithoutTitle(""));
        }
    }

    public JsonNode performChangeLocale(String locale) {
        try {
            DynamicSettings.getInstance().setLocale(locale);
            DynamicSettings.getInstance().saveSettings();
            logger.debugf("Locale changed to %s", locale);
            return objectMapper.createObjectNode()
                    .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.UPDATE_CURRENT_SCREEN.toString());
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performGetLocales() {
        logger.debug("Get available locales");
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.LOCALE_DIALOG.toString());
    }

    public JsonNode performOpenAbout() {
        logger.info("Show about");
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_ABOUT.toString())
                .put(BackendConstants.PAYLOAD_KEY, "Hello about");
    }

    public JsonNode performExit() {
        try {
            resumeManager.saveAll();
            DynamicSettings.getInstance().saveSettings();
            logger.info("Perform exit, save all resumes and settings");
            return objectMapper.createObjectNode()
                    .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.CLOSE.toString());
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }
}
