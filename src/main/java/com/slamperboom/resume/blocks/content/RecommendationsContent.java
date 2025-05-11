package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.List;

public class RecommendationsContent implements IContent {
    @JsonProperty("recommendations")
    private List<Recommendation> recommendations;

    @Override
    public ContentType getContentType() {
        return ContentType.RECOMMENDATIONS;
    }

    private static class Recommendation{
        @JsonProperty("recommending")
        private String recommending;

        @JsonProperty("company")
        private String company;

        @JsonProperty("email")
        private String email;

        @JsonProperty("phone_number")
        private String phoneNumber;
    }
}
