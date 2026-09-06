package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.Map;

public interface IResume {
    // SerializerProvider attribute key used to pass this resume's own locale (as opposed to
    // the app-wide UI locale) into per-field date serializers during tree/JSON serialization.
    String RESUME_LOCALE_ATTRIBUTE = "resumeLocale";

    int getSchemaVersion();
    String getId();
    String getName();
    String getResumeLocale();
    Map<ContentType, IContent> getBlocks();
    JsonNode getJson();
    JsonNode getTranslatedJson();
    String getTemplateName();
    boolean isSaved();
    void updateContent(ContentType contentType, JsonNode content) throws UserException;
    void updateResumeInformation(JsonNode information) throws UserException;
}
