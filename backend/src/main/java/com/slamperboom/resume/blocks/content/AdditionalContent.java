package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.serializationUtilities.MarkdownSerializer;

public class AdditionalContent implements IContent {
    @JsonProperty("additional_info")
    @JsonSerialize(using = MarkdownSerializer.class)
    private String additionalInfo;

    @Override
    public ContentType getContentType() {
        return ContentType.ADDITIONAL;
    }
}
