package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

@JsonTypeName("About_Content")
public class AboutContent implements IContent {
    @JsonProperty("about_text")
    private String aboutText;

    @Override
    public ContentType getContentType() {
        return ContentType.ABOUT;
    }
}
