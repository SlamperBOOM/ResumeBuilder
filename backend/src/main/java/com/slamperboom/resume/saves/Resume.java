package com.slamperboom.resume.saves;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.blocks.common.ContentMapper;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.settings.Settings;
import lombok.Setter;
import org.jboss.logging.Logger;

import java.util.Map;

/**
 * Contains resume and filled blocks of resume
 * This can be transformed into HTML or PDF doc
 */
public class Resume implements IResume {
    @JsonIgnore
    private final ObjectMapper defaultObjectMapper;
    @JsonIgnore
    private final ObjectMapper translatedObjectMapper;

    @JsonProperty("resume_id")
    private final String id;

    @JsonProperty("version_of_last_edit")
    @Setter
    private String versionOfLastEdit;

    @JsonProperty("resume_name")
    @Setter
    private String resumeName;

    @JsonProperty("template_name")
    @Setter
    private String templateName;

    @JsonProperty("blocks")
    @Setter
    private Map<ContentType, IContent> blocks;

    @JsonIgnore
    private boolean isSaved = false;

    protected Resume(@JsonProperty("resume_id") String id) {
        this.id = id;

        defaultObjectMapper = new ObjectMapper();
        defaultObjectMapper.enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        defaultObjectMapper.registerModule(new JavaTimeModule());

        translatedObjectMapper = new ObjectMapper();
        translatedObjectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        translatedObjectMapper.registerModule(new JavaTimeModule());
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
        return defaultObjectMapper.valueToTree(this);
    }

    @Override
    @JsonIgnore
    public JsonNode getTranslatedJson() {
        return translatedObjectMapper.valueToTree(this);
    }

    @Override
    @JsonIgnore
    public String getTemplateName() {
        return templateName;
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
    public void updateContent(ContentType contentType, JsonNode content) throws UserException {
        try {
            blocks.put(contentType, defaultObjectMapper.treeToValue(content, ContentMapper.mapContent(contentType).getClass()));
            versionOfLastEdit = Settings.getInstance().getVersion();
            isSaved = false;
        } catch (JsonProcessingException e) {
            throw new UserException(ErrorCode.UNABLE_TO_UPDATE_RESUME_BLOCK, e);
        }
    }

    @Override
    public void updateResumeInformation(JsonNode information) {
        this.resumeName = information.get("resume_name").asText();
        this.templateName = information.get("template_name").asText();
        isSaved = false;
    }
}
