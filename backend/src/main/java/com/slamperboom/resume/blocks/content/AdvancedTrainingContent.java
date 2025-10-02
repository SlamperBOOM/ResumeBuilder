package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.List;

public class AdvancedTrainingContent implements IContent {
    @JsonProperty("trainings")
    private List<Training> trainings;

    @Override
    public ContentType getContentType() {
        return ContentType.ADVANCED_TRAINING;
    }

    private static class Training{
        @JsonProperty("course_name")
        private String courseName;

        @JsonProperty("organization")
        private String organization;

        @JsonProperty("year_of_graduate")
        private String yearOfGraduate;
    }
}
