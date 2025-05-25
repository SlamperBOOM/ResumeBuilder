package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.List;
import java.util.Map;

public interface IResume {
    String getVersionOfLastEdit();
    String getId();
    String getName();
    Map<ContentType, IContent> getBlocks();
    JsonNode getJson();
    JsonNode getTranslatedJson();
    boolean isSaved();
    void updateContent(ContentType contentType, JsonNode content);
}
