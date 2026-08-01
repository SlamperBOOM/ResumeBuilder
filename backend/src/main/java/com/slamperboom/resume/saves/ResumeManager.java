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
import com.slamperboom.translations.TranslationsManager;
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
    private static final String SAVE_PATH = "saves/";
    private final Logger logger = Logger.getLogger(this.getClass());
    private final ObjectMapper objectMapper;
    private final Map<String, Resume> resumes = new HashMap<>();
    private final Map<String, File> resumeFileMap = new HashMap<>();

    private ResumeManager() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        readAllResumes();
    }

    @Override
    public List<SimpleResume> getListOfResumes() {
        return resumes.values().stream()
                .map(resume -> {
                    var file = resumeFileMap.get(resume.getId());
                    try {
                        return Optional.of(new SimpleResume(
                                resume.getId(),
                                resume.getName(),
                                LocalDateTime.ofInstant(
                                        Instant.ofEpochMilli(file.lastModified()), ZoneId.systemDefault()
                                ),
                                HTMLConverter.saveHTMLtoPDFBase64(HTMLConverter.processResumeToHTML(resume))
                        ));
                    } catch (UserException | IOException e) {
                        logger.error("Unable to read resume for main screen");
                        e.printStackTrace();
                        return Optional.empty();
                    }
                })
                .filter(Optional::isPresent)
                .map(resume -> (SimpleResume) resume.get())
                .sorted((o1, o2) -> o2.lastModificationDate().compareTo(o1.lastModificationDate()))
                .toList();
    }

    @Override
    public void saveResume(String resumeId) throws UserException {
        Resume resume = resumes.get(resumeId);
        if (resume.isSaved()) {
            return;
        }
        File saveFile = resumeFileMap.get(resumeId);
        try {
            if (saveFile == null || !saveFile.exists()) {
                File saveDir = new File(SAVE_PATH);
                if (!saveDir.exists() && !saveDir.mkdir()) {
                    throw new IOException("Cannot create saves directory");
                }
                saveFile = new File(SAVE_PATH + resume.getId() + ".json");
                if (!saveFile.exists() && !saveFile.createNewFile()) {
                    throw new IOException("Cannot create save file for resume \"" + resume.getName() + "\"");
                }
                resumeFileMap.put(resumeId, saveFile);
            }
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(saveFile), StandardCharsets.UTF_8);
            writer.write(resume.getJson().toPrettyString());
            resume.save();
            writer.close();
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
        File savesDir = new File(SAVE_PATH);
        File[] saves = savesDir.listFiles();
        if (saves == null) {
            savesDir.mkdir();
            logger.info("Resume save dir was created");
            return;
        }
        for (File saveFile : saves) {
            try {
                JsonNode json = objectMapper.readTree(saveFile);
                Resume resume = objectMapper.treeToValue(json, Resume.class);
                resume.save();
                resumes.put(resume.getId(), resume);
                resumeFileMap.put(resume.getId(), saveFile);
            } catch (IOException e) {
                logger.errorf("Unable to read resume %s", e.toString());
            }
        }
    }

    @Override
    public String getSaveFolderPath() {
        return SAVE_PATH;
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
            throw new UserException(ErrorCode.NO_RESUME_FOR_DUPLICATE);
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
        String htmlResume = HTMLConverter.processResumeToHTML(resume);
        try {
            HTMLConverter.saveHTMLtoPDF(htmlResume, savePath);
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
        } catch (IOException e) {
            throw new UserException(ErrorCode.UNABLE_TO_DELETE_RESUME, e);
        }
    }
}
