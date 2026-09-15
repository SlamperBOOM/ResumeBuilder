package com.slamperboom.resume;

import com.slamperboom.exceptions.UserException;
import com.slamperboom.htmlConvertion.HTMLConverter;
import com.slamperboom.managers.TranslationsManager;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.saves.*;
import com.slamperboom.resume.saves.migrations.MigrationRegistry;
import com.slamperboom.settings.Settings;
import com.slamperboom.testutil.FileSystemIsolationExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.File;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

/**
 * {@link ResumeManager} reads/writes the hard-coded relative "saves/" directory and has a
 * private no-arg constructor, which makes it awkward to unit test in isolation - see review
 * notes recommending an injectable save directory. Until that lands, this test:
 * <ul>
 *     <li>relies on {@link FileSystemIsolationExtension} to back up/restore "saves/" on disk
 *     around every test, so the developer's real resumes are never touched;</li>
 *     <li>uses reflection to reach the private constructor, since {@code ResumeManager} is
 *     otherwise only ever constructed by the CDI container.</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
@ExtendWith(FileSystemIsolationExtension.class)
class ResumeManagerTest {

    @Mock
    private HTMLConverter htmlConverter;

    @Mock
    private TranslationsManager translationsManager;

    private final ResumeLoader resumeLoader = new ResumeLoader(new MigrationRegistry());

    private IResumeManager manager;

    @BeforeEach
    void setUp() throws Exception {
        manager = newManager();
    }

    private IResumeManager newManager() throws Exception {
        Constructor<ResumeManager> constructor = ResumeManager.class.getDeclaredConstructor(
                HTMLConverter.class,
                ResumeLoader.class,
                TranslationsManager.class
        );
        constructor.setAccessible(true);
        return constructor.newInstance(htmlConverter, resumeLoader, translationsManager);
    }

    @Test
    void freshManager_hasNoResumes() throws UserException {
        assertTrue(manager.getListOfResumes().isEmpty());
    }

    @Test
    void createResume_addsResumeToListAndPersistsFile() throws UserException {
        String id = manager.createResume("My new resume");

        assertNotNull(id);
        IResume created = manager.getResume(id);
        assertNotNull(created);
        assertEquals("My new resume", created.getName());
        assertTrue(created.isSaved());
        assertTrue(new File("saves/" + id + ".json").exists(),
                "createResume() should persist the resume file immediately");
    }

    @Test
    void createResume_populatesAllContentBlockTypes() throws UserException {
        String id = manager.createResume("My new resume");

        IResume created = manager.getResume(id);
        for (ContentType type : ContentType.values()) {
            assertTrue(created.getBlocks().containsKey(type), "missing default block for " + type);
        }
    }

    @Test
    void getResume_withUnknownId_returnsNull() {
        assertNull(manager.getResume("does-not-exist"));
    }

    @Test
    void duplicateResume_copiesContentUnderNewIdWithSuffixedName() throws UserException {
        String originalId = manager.createResume("Original");

        String duplicateId = manager.duplicateResume(originalId);

        assertNotEquals(originalId, duplicateId);
        IResume duplicate = manager.getResume(duplicateId);
        assertEquals("Original (New)", duplicate.getName());
    }

    @Test
    void duplicateResume_withUnknownId_throwsUserException() {
        assertThrows(UserException.class, () -> manager.duplicateResume("does-not-exist"));
    }

    @Test
    void deleteResume_removesResumeAndItsFile() throws UserException {
        String id = manager.createResume("To delete");
        File saveFile = new File("saves/" + id + ".json");
        assertTrue(saveFile.exists());

        manager.deleteResume(id);

        assertNull(manager.getResume(id));
        assertFalse(saveFile.exists());
    }

    @Test
    void deleteResume_withUnknownId_doesNothing() {
        assertDoesNotThrow(() -> manager.deleteResume("does-not-exist"));
    }

    @Test
    void saveResume_onAlreadySavedResume_isANoOp() throws UserException {
        String id = manager.createResume("Already saved");
        File saveFile = new File("saves/" + id + ".json");
        long firstModified = saveFile.lastModified();

        manager.saveResume(id);

        assertEquals(firstModified, saveFile.lastModified(),
                "saveResume() should skip writing when the resume is already marked saved");
    }

    @Test
    void readAllResumes_reloadsResumesPersistedByAPreviousManagerInstance() throws Exception {
        String id = manager.createResume("Persisted resume");

        IResumeManager freshManager = newManager();

        List<SimpleResume> resumes = freshManager.getListOfResumes();
        assertEquals(1, resumes.size());
        assertEquals(id, resumes.get(0).resumeId());
    }

    @Test
    void readAllResumes_calledAgainWithNoChanges_keepsResumeIntact() throws UserException {
        String id = manager.createResume("Stays put");

        manager.readAllResumes();
        manager.readAllResumes();

        assertNotNull(manager.getResume(id));
        assertEquals(1, manager.getListOfResumes().size());
    }

    @Test
    void readAllResumes_calledRepeatedly_doesNotDuplicateResumes() throws UserException {
        manager.createResume("First");
        manager.createResume("Second");

        manager.readAllResumes();
        manager.readAllResumes();
        manager.readAllResumes();

        assertEquals(2, manager.getListOfResumes().size());
    }

    @Test
    void readAllResumes_picksUpFileAddedByAnotherManagerInstance() throws Exception {
        assertTrue(manager.getListOfResumes().isEmpty());

        IResumeManager anotherManager = newManager();
        String externalId = anotherManager.createResume("Added by another instance");

        // `manager` has not been told about this yet - its own maps were never touched.
        assertNull(manager.getResume(externalId));

        manager.readAllResumes();

        IResume picked = manager.getResume(externalId);
        assertNotNull(picked);
        assertEquals("Added by another instance", picked.getName());
    }

    @Test
    void readAllResumes_reloadsResumeWhoseFileWasEditedExternally() throws Exception {
        String id = manager.createResume("Original name");
        File saveFile = new File("saves/" + id + ".json");

        String updatedJson = Files.readString(saveFile.toPath())
                .replace("Original name", "Edited outside the app");
        Files.writeString(saveFile.toPath(), updatedJson);
        // File mtime resolution can be as coarse as one second on some filesystems - push
        // it forward explicitly so the change is reliably detected regardless of timing.
        assertTrue(saveFile.setLastModified(saveFile.lastModified() + 5000));

        manager.readAllResumes();

        assertEquals("Edited outside the app", manager.getResume(id).getName());
    }

    @Test
    void readAllResumes_removesResumeWhoseFileWasDeletedExternally() throws UserException {
        String id = manager.createResume("Deleted outside the app");
        File saveFile = new File("saves/" + id + ".json");
        assertTrue(saveFile.exists());

        assertTrue(saveFile.delete()); // bypasses manager.deleteResume() entirely

        manager.readAllResumes();

        assertNull(manager.getResume(id));
        assertTrue(manager.getListOfResumes().isEmpty());
    }

    @Test
    void readAllResumes_leavesUnsavedInMemoryResumeUntouched() throws Exception {
        // Simulates a resume that exists in memory but has never been synced with disk yet
        // (no file, no lastKnownModified entry) - e.g. a hypothetical future code path that
        // doesn't call saveResume() synchronously right after mutating state. readAllResumes()
        // must never discard this just because nothing on disk backs it.
        Resume unsavedResume = new Resume("unsaved-id");
        unsavedResume.setResumeName("Not saved yet");

        Field resumesField = ResumeManager.class.getDeclaredField("resumes");
        resumesField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, Resume> resumes = (Map<String, Resume>) resumesField.get(manager);
        resumes.put("unsaved-id", unsavedResume);

        manager.readAllResumes();

        IResume stillThere = manager.getResume("unsaved-id");
        assertNotNull(stillThere, "readAllResumes() must not drop resumes it never confirmed were on disk");
        assertEquals("Not saved yet", stillThere.getName());
    }

    @Test
    void readAllResumes_afterSavesDirectoryIsReplaced_forgetsStaleResumes() throws UserException {
        String staleId = manager.createResume("From a previous test");
        assertEquals(1, manager.getListOfResumes().size());

        File savesDir = new File(Settings.getInstance().getResumeSavePath());
        for (File file : Objects.requireNonNull(savesDir.listFiles())) {
            assertTrue(file.delete());
        }

        manager.readAllResumes();

        assertNull(manager.getResume(staleId));
        assertTrue(manager.getListOfResumes().isEmpty());
    }

    @Test
    void getSaveFolderPath_returnsConfiguredSavesDirectory() {
        assertEquals("saves/", Settings.getInstance().getResumeSavePath());
    }
}
