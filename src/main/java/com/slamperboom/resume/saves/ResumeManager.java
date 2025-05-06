package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.resume.blocks.common.*;
import com.slamperboom.settings.Settings;
import java.io.*;
import java.nio.charset.StandardCharsets;
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
                saveFile = new File(SAVE_PATH + resume.getName());
                if (!saveFile.createNewFile()) {
                    throw new IOException("Cannot create save file for resume " + resume.getName());
                }
            }
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(saveFile));
            writer.write(resume.getJson().toString());
            writer.close();
            resume.save();
        } catch (IOException e){
            System.err.println("Unable to save resume " + resume.getName());
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
                /*String resumeId = json.get("resume_id").asText();
                Resume resume = new Resume(resumeId);
                resume.setResumeName(json.get("resume_name").asText());
                resume.setVersionOfLastEdit(json.get("version_of_last_edit").asText());

                JSONArray jsonBlocks = object.getJSONArray("blocks");
                List<IBlock> resumeBlocks = new ArrayList<>(jsonBlocks.length());
                for (int i=0; i<jsonBlocks.length(); ++i) {
                    JSONObject block = jsonBlocks.getJSONObject(i);
                    BlockType type = BlockType.valueOf(block.getString("block_name"));
                    IContent content = ContentMapper.MapContent(type);
                    content.updateContent(block.getJSONObject("content"));
                    resumeBlocks.add(new Block(type, content));
                }
                resume.setBlocks(resumeBlocks);*/
                resumes.put(resume.getId(), resume);
                resumeFileMap.put(resume.getId(), saveFile);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public IResume getCurrentResume() {
        return resumes.get(currentResumeId);
    }

    @Override
    public void setCurrentResume(String resumeId) {
        currentResumeId = resumeId;
    }

    @Override
    public void createResume(String resumeName) {
        String resumeId = UUID.randomUUID().toString();
        Resume resume = new Resume(resumeId);
        resume.setResumeName(resumeName);

        // adding required blocks
        List<String> listOfRequiredBlocks = settings.getRequiredBlocksList();
        List<IBlock> blocks = new ArrayList<>();
        for (String blockName : listOfRequiredBlocks) {
            BlockType blockType = BlockType.valueOf(blockName);
            Block block = new Block(blockType, ContentMapper.mapContent(blockType));
            blocks.add(block);
        }
        resume.setBlocks(blocks);

        resumes.put(resumeId, resume);
    }
}
