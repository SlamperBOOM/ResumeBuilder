package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.htmlConverter.HTMLConverter;
import com.slamperboom.htmlConverter.HTMLTemplateManager;
import com.slamperboom.resume.blocks.common.ContentMapper;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.settings.Settings;
import com.slamperboom.managers.TranslationsManager;
import com.slamperboom.utils.ThreadPoolReducer;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@ApplicationScoped
public class ResumeManager implements IResumeManager{
    private final Logger logger = Logger.getLogger(this.getClass());
    private final ObjectMapper objectMapper;
    private final Map<String, Resume> resumes = new HashMap<>();
    private final Map<String, File> resumeFileMap = new HashMap<>();
    private final Map<String, Long> lastKnownModified = new HashMap<>();
    private final HTMLConverter htmlConverter;
    private final ThreadPoolReducer<Resume, SimpleResume> resumeReducer;

    private Optional<SimpleResume> convertToSimpleResume(Resume resume) {
        var file = resumeFileMap.get(resume.getId());
        try {
            return Optional.of(new SimpleResume(
                    resume.getId(),
                    resume.getName(),
                    LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(file.lastModified()), ZoneId.systemDefault()
                    ),
                    htmlConverter.saveHTMLtoPDFBase64(htmlConverter.processResumeToHTML(resume))
            ));
        } catch (UserException | IOException e) {
            logger.errorf("Unable to build simple resume object for %s", resume.getId());
            return Optional.empty();
        }
    }

    ResumeManager(HTMLConverter htmlConverter) {
        this.htmlConverter = htmlConverter;

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        readAllResumes();

        resumeReducer = new ThreadPoolReducer<>();
    }

    @Override
    public List<SimpleResume> getListOfResumes() throws UserException {
        List<SimpleResume> nodes = resumeReducer.reduceTasks(resumes.values(), this::convertToSimpleResume);

        nodes.sort((o1, o2) -> o2.lastModificationDate().compareTo(o1.lastModificationDate()));
        return nodes;
    }

    @Override
    public void saveResume(String resumeId) throws UserException {
        Resume resume = resumes.get(resumeId);
        if (resume.isSaved()) {
            return;
        }
        File saveFile = resumeFileMap.get(resumeId);
        String savePath = Settings.getInstance().getResumeSavePath();
        try {
            if (saveFile == null || !saveFile.exists()) {
                File saveDir = new File(savePath);
                if (!saveDir.exists() && !saveDir.mkdir()) {
                    throw new IOException("Cannot create saves directory");
                }
                saveFile = new File(savePath + resume.getId() + ".json");
                if (!saveFile.exists() && !saveFile.createNewFile()) {
                    throw new IOException("Cannot create save file for resume \"" + resume.getName() + "\"");
                }
                resumeFileMap.put(resumeId, saveFile);
            }
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(saveFile), StandardCharsets.UTF_8);
            writer.write(resume.getJson().toPrettyString());
            resume.save();
            writer.close();
            lastKnownModified.put(resumeId, saveFile.lastModified());
        } catch (IOException e){
            logger.errorf("Unable to save resume %s: %s", resume.getId(), e);
            throw new UserException(ErrorCode.RESUME_SAVE_ERROR, e);
        }
    }

    @Override
    public void saveAll() throws UserException {
        for (Resume resume : resumes.values()) {
            if (!resume.isSaved()) {
                saveResume(resume.getId());
            }
        }
    }

    @Override
    public void readAllResumes() {
        File savesDir = new File(Settings.getInstance().getResumeSavePath());
        File[] saves = savesDir.listFiles();

        if (saves == null) {
            savesDir.mkdir();
            logger.info("Resume save dir was created");
            saves = new File[0];
        }

        Set<String> idsOnDisk = new HashSet<>();

        for (File saveFile : saves) {
            String fileId = resumeIdFromFileName(saveFile.getName());
            if (fileId == null) {
                continue; // not a "<id>.json" resume file - ignore
            }
            idsOnDisk.add(fileId);

            long onDiskModified = saveFile.lastModified();
            Long knownModified = lastKnownModified.get(fileId);
            boolean isNewToUs = knownModified == null;
            boolean changedOnDisk = knownModified != null && onDiskModified > knownModified;

            if (!isNewToUs && !changedOnDisk) {
                continue; // already in sync with what's in memory - skip reparsing it
            }

            try {
                JsonNode json = objectMapper.readTree(saveFile);
                Resume resume = objectMapper.treeToValue(json, Resume.class);
                resume.save();
                resumes.put(resume.getId(), resume);
                resumeFileMap.put(resume.getId(), saveFile);
                lastKnownModified.put(resume.getId(), onDiskModified);
            } catch (IOException e) {
                logger.errorf("Unable to read resume %s", e.toString());
            }
        }

        // Drop resumes we previously confirmed were backed by a file on disk but whose file
        // has since disappeared (deleted/moved outside the app - or, during tests,
        // FileSystemIsolationExtension swapping "saves/" out from under us between tests).
        // A resume that only exists in memory and has never been synced from/to disk yet
        // (no entry in lastKnownModified - e.g. mid-creation, before saveResume() has run)
        // is left untouched, so genuinely unsaved data is never silently discarded here.
        Iterator<Map.Entry<String, Long>> it = lastKnownModified.entrySet().iterator();
        while (it.hasNext()) {
            String id = it.next().getKey();
            if (!idsOnDisk.contains(id)) {
                resumes.remove(id);
                resumeFileMap.remove(id);
                it.remove();
            }
        }
    }

    private String resumeIdFromFileName(String fileName) {
        if (!fileName.endsWith(".json")) {
            return null;
        }
        return fileName.substring(0, fileName.length() - ".json".length());
    }

    @Override
    public IResume getResume(String resumeID) {
        return resumes.get(resumeID);
    }

    @Override
    public String createResume(String resumeName) throws UserException {
        logger.infof("Creating new resume with name %s", resumeName);
        String resumeId = UUID.randomUUID().toString();
        Resume resume = new Resume(resumeId);
        resume.setResumeName(resumeName);
        resume.setVersionOfLastEdit(Settings.getInstance().getVersion());
        resume.setTemplateName(HTMLTemplateManager.getDefaultTemplateName());
        resume.setResumeLocale(TranslationsManager.getInstance().getCurrentLocaleString());

        Map<ContentType, IContent> blocks = new EnumMap<>(ContentType.class);
        for (ContentType contentType: ContentType.values()) {
            IContent block = ContentMapper.mapContent(contentType);
            blocks.put(contentType, block);
        }
        resume.setBlocks(blocks);

        resumes.put(resumeId, resume);
        saveResume(resumeId);
        logger.infof("Resume with id %s created", resumeId);
        return resumeId;
    }

    @Override
    public String duplicateResume(String duplicateResumeId) throws UserException {
        Resume duplicateResume = resumes.get(duplicateResumeId);
        if (duplicateResume == null){
            throw new UserException(ErrorCode.RESUME_NOT_FOUND);
        }
        String resumeId = UUID.randomUUID().toString();

        ObjectNode duplicateResumeJson = objectMapper.valueToTree(duplicateResume);
        duplicateResumeJson.put("resume_id", resumeId);

        try {
            Resume newResume = objectMapper.treeToValue(duplicateResumeJson, Resume.class);
            newResume.setResumeName(duplicateResume.getName() + " (New)");
            resumes.put(resumeId, newResume);
            saveResume(resumeId);
        } catch (IOException e) {
            throw new UserException(ErrorCode.UNABLE_TO_DUPLICATE_RESUME, e);
        }

        return resumeId;
    }

    @Override
    public String importResumeFromFile(String fileName) throws UserException {
        File importedResumeFile = new File(fileName);
        try {
            JsonNode json = objectMapper.readTree(importedResumeFile);
            Resume resume = objectMapper.treeToValue(json, Resume.class);
            resumes.put(resume.getId(), resume);
            saveResume(resume.getId());
            return resume.getId();
        } catch (IOException e) {
            logger.errorf("Unable to read resume %s", e.toString());
            throw new UserException(ErrorCode.UNABLE_TO_SAVE_PDF, e);
        }
    }

    @Override
    public void exportResumeToPDF(String resumeID, String savePath) throws UserException {
        IResume resume = getResume(resumeID);
        String htmlResume = htmlConverter.processResumeToHTML(resume);
        try {
            htmlConverter.saveHTMLtoPDF(htmlResume, savePath);
        } catch (IOException e) {
            throw new UserException(ErrorCode.UNABLE_TO_SAVE_PDF, e);
        }
    }

    @Override
    public void deleteResume(String resumeId) throws UserException {
        Resume resume = resumes.get(resumeId);
        if (resume == null) {
            return;
        }
        var resumeFile = resumeFileMap.get(resumeId);
        try {
            Files.delete(resumeFile.toPath());
            resumes.remove(resumeId);
            resumeFileMap.remove(resumeId);
            lastKnownModified.remove(resumeId);
        } catch (IOException e) {
            throw new UserException(ErrorCode.UNABLE_TO_DELETE_RESUME, e);
        }
    }
}
