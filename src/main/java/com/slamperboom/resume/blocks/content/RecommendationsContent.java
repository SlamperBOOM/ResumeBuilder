package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.IContent;

public class RecommendationsContent implements IContent {
    @JsonProperty("recommending")
    private String recommending;

    @JsonProperty("company")
    private String company;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;
}
