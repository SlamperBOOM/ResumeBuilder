package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.serializationUtilities.MarkdownSerializer;

@JsonTypeName("About_Content")
public class AboutContent implements IContent {
    @JsonProperty("about_text")
    @JsonSerialize(using = MarkdownSerializer.class)
    private String aboutText;

    @Override
    public ContentType getContentType() {
        return ContentType.ABOUT;
    }
}
