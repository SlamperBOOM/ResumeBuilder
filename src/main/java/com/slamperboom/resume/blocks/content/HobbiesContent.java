package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.IContent;

public class HobbiesContent implements IContent {
    @JsonProperty("hobbies")
    private String hobbies;
}
