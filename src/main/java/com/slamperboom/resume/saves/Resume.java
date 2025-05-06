package com.slamperboom.resume.saves;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.resume.blocks.common.BlockType;
import com.slamperboom.resume.blocks.common.IBlock;
import lombok.Setter;

import java.util.List;

/**
 * Contains resume and filled blocks of resume
 * This can be transformed into HTML or PDF doc
 */
public class Resume implements IResume {
    @JsonProperty("resume_id")
    private final String id;

    @JsonProperty("version_of_last_edit")
    @Setter
    private String versionOfLastEdit;

    @JsonProperty("resume_name")
    @Setter
    private String resumeName;

    @JsonProperty("blocks")
    @Setter
    private List<IBlock> blocks;

    @JsonIgnore
    private boolean isSaved;

    protected Resume(String id) {
        this.id = id;
    }

    @Override
    public String getVersionOfLastEdit() {
        return versionOfLastEdit;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public String getName() {
        return resumeName;
    }

    @Override
    public List<IBlock> getBlocks() {
        return blocks;
    }

    @Override
    public JsonNode getJson() {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.valueToTree(this);
    }

    public void save(){
        isSaved = true;
    }

    @Override
    public boolean isSaved() {
        return isSaved;
    }

    @Override
    public void updateContent(BlockType blockType, JsonNode content) {
        blocks.stream().filter(b -> b.getBlockType() == blockType).findFirst()
                .ifPresent(b -> b.updateContent(content));
    }
}
