package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.IContent;

public class AboutContent implements IContent {
    @JsonProperty("about_text")
    private String aboutText;
}
