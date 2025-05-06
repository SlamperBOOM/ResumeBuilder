package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.resume.blocks.common.IContent;

public class AdvancedTrainingContent implements IContent {
    @JsonProperty("course_name")
    private String courseName;

    @JsonProperty("organization")
    private String organization;

    @JsonProperty("year_of_graduate")
    private String yearOfGraduate;
}
