package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.resume.blocks.common.ContentMapper;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.settings.Settings;

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

public class ResumeManager implements IResumeManager{
    private static final String SAVE_PATH = "saves/";
    private final Settings settings = Settings.getInstance();
    private final ObjectMapper objectMapper;
    private final Map<String, Resume> resumes = new HashMap<>();
    private final Map<String, File> resumeFileMap = new HashMap<>();

    public ResumeManager() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public List<SimpleResume> getListOfResumes() {
        return resumes.values().stream().map(resume -> {
            var file = resumeFileMap.get(resume.getId());
            return new SimpleResume(
                    resume.getId(),
                    resume.getName(),
                    file,
                    LocalDateTime.ofInstant(
                            Instant.ofEpochMilli(file.lastModified()), ZoneId.systemDefault()
                    )
            );
        }).toList();
    }

    @Override
    public void saveResume(String resumeId) {
        Resume resume = resumes.get(resumeId);
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
            writer.close();
            resume.save();
        } catch (IOException e){
            System.err.println("Unable to save resume \"" + resume.getName() + "\": " + e);
        }
    }

    @Override
    public void saveAll() {
        for (Resume resume : resumes.values()) {
            saveResume(resume.getId());
        }
    }

    @Override
    public void readAllResumes() {
        File savesDir = new File(SAVE_PATH);
        File[] saves = savesDir.listFiles();
        if (saves == null || saves.length == 0) {
            throw new EmptyStackException();
        }
        for (File saveFile : saves) {
            try {
                JsonNode json = objectMapper.readTree(saveFile);
                Resume resume = objectMapper.treeToValue(json, Resume.class);
                resumes.put(resume.getId(), resume);
                resumeFileMap.put(resume.getId(), saveFile);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public File getSaveFolder() {
        return new File(SAVE_PATH);
    }

    @Override
    public IResume getResume(String resumeID) {
        return resumes.get(resumeID);
    }

    @Override
    public String createResume(String resumeName) {
        String resumeId = UUID.randomUUID().toString();
        Resume resume = new Resume(resumeId);
        resume.setResumeName(resumeName);
        resume.setVersionOfLastEdit(Settings.getInstance().getVersion());
        resume.setTemplateName("simple_template");

        // adding required blocks
        List<String> listOfRequiredBlocks = settings.getRequiredBlocksList();
        Map<ContentType, IContent> blocks = new EnumMap<>(ContentType.class);
        for (String blockName : listOfRequiredBlocks) {
            ContentType contentType = ContentType.valueOf(blockName);
            IContent block = ContentMapper.mapContent(contentType);
            blocks.put(contentType, block);
        }
        resume.setBlocks(blocks);

        resumes.put(resumeId, resume);
        return resumeId;
    }

    @Override
    public String duplicateResume(String duplicateResumeId) {
        Resume duplicateResume = resumes.get(duplicateResumeId);
        if (duplicateResume == null){
            throw new RuntimeException();
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
            throw new RuntimeException(e);
        }

        return resumeId;
    }

    @Override
    public void deleteResume(String resumeId) {
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
            throw new RuntimeException(e);
        }
    }
}
