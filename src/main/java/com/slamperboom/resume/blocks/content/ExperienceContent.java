package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.Date;
import java.util.List;

public class ExperienceContent implements IContent {
    @JsonProperty("experiences")
    private List<WorkExperience> workExperiences;

    @Override
    public ContentType getContentType() {
        return ContentType.EXPERIENCE;
    }

    private static class WorkExperience {
        @JsonProperty("position")
        private String position;

        @JsonProperty("company")
        private String company;

        @JsonProperty("start_date")
        private Date startDate;

        @JsonProperty("end_date")
        private Date endDate;

        @JsonProperty("is_still_working")
        private boolean isStillWorking;

        @JsonProperty("work_description")
        private String workDescription;
    }
}
