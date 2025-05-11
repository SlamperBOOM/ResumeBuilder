package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

public class AdditionalContent implements IContent {
    @JsonProperty("additional_info")
    private String additionalInfo;

    @Override
    public ContentType getContentType() {
        return ContentType.ADDITIONAL;
    }
}
