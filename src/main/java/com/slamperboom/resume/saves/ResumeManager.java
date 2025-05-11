package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.resume.blocks.common.*;
import com.slamperboom.settings.Settings;
import java.io.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

public class ResumeManager implements IResumeManager{
    private static final String SAVE_PATH = "saves/";
    private final Settings settings = Settings.getInstance();
    private final Map<String, Resume> resumes = new HashMap<>();
    private final Map<String, File> resumeFileMap = new HashMap<>();
    private String currentResumeId;

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
                saveFile = new File(SAVE_PATH + resume.getName() + ".json");
                if (!saveFile.exists() && !saveFile.createNewFile()) {
                    throw new IOException("Cannot create save file for resume \"" + resume.getName() + "\"");
                }
                resumeFileMap.put(resumeId, saveFile);
            }
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(saveFile));
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
        ObjectMapper objectMapper = new ObjectMapper();
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
    public IResume getCurrentResume() {
        Resume currentResume = resumes.get(currentResumeId);
        if (currentResume == null) {
            if (resumes.isEmpty()) {
                return null;
            } else {
                return resumes.values().stream().findFirst().get();
            }
        } else {
            return currentResume;
        }
    }

    @Override
    public void setCurrentResume(String resumeId) {
        currentResumeId = resumeId;
    }

    @Override
    public String createResume(String resumeName) {
        String resumeId = UUID.randomUUID().toString();
        Resume resume = new Resume(resumeId);
        resume.setResumeName(resumeName);
        resume.setVersionOfLastEdit(Settings.getInstance().getVersion());

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
}
