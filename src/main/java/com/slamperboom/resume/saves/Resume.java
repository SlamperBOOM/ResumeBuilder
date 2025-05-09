package com.slamperboom.resume.saves;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.resume.blocks.common.ContentMapper;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import lombok.AllArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

/**
 * Contains resume and filled blocks of resume
 * This can be transformed into HTML or PDF doc
 */
public class Resume implements IResume {
    @JsonIgnore
    private final ObjectMapper objectMapper = new ObjectMapper();

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
    private Map<ContentType, IContent> blocks;

    @JsonIgnore
    private boolean isSaved;

    protected Resume(@JsonProperty("resume_id") String id) {
        this.id = id;
    }

    @Override
    @JsonIgnore
    public String getVersionOfLastEdit() {
        return versionOfLastEdit;
    }

    @Override
    @JsonIgnore
    public String getId() {
        return id;
    }

    @Override
    @JsonIgnore
    public String getName() {
        return resumeName;
    }

    @Override
    @JsonIgnore
    public Map<ContentType, IContent> getBlocks() {
        return blocks;
    }

    @Override
    @JsonIgnore
    public JsonNode getJson() {
        return objectMapper.valueToTree(this);
    }

    public void save(){
        isSaved = true;
    }

    @Override
    @JsonIgnore
    public boolean isSaved() {
        return isSaved;
    }

    @Override
    public void updateContent(ContentType contentType, JsonNode content) {
        try {
            blocks.put(contentType, objectMapper.treeToValue(content, ContentMapper.mapContent(contentType).getClass()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
