package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.Map;

public interface IResume {
    String getVersionOfLastEdit();
    String getId();
    String getName();
    String getResumeLocale();
    Map<ContentType, IContent> getBlocks();
    JsonNode getJson();
    JsonNode getTranslatedJson();
    String getTemplateName();
    boolean isSaved();
    void updateContent(ContentType contentType, JsonNode content) throws UserException;
    void updateResumeInformation(JsonNode information);
}
