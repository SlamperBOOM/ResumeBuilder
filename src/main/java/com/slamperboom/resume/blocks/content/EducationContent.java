package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import java.util.List;

public class EducationContent implements IContent {
    @JsonProperty("educations")
    private List<Education> educations;

    @Override
    public ContentType getContentType() {
        return ContentType.EDUCATION;
    }

    private static class Education {
        @JsonProperty("institution")
        private String institution;

        @JsonProperty("education_level")
        private EducationContentEducationLevel educationLevel;

        @JsonProperty("faculty")
        private String faculty;

        @JsonProperty("speciality")
        private String speciality;

        @JsonProperty("year_of_graduate")
        private String yearOfGraduate;
    }
}
