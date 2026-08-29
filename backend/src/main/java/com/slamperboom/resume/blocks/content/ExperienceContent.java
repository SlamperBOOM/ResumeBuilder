package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.serializationUtilities.MarkdownSerializer;
import com.slamperboom.resume.blocks.content.serializationUtilities.MonthYearDateSerializer;

import java.time.LocalDate;
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

        @JsonSerialize(using = MonthYearDateSerializer.class)
        @JsonProperty("start_date")
        private LocalDate startDate;

        @JsonSerialize(using = MonthYearDateSerializer.class)
        @JsonProperty("end_date")
        private LocalDate endDate;

        @JsonProperty("is_still_working")
        private boolean isStillWorking;

        @JsonProperty("work_description")
        @JsonSerialize(using = MarkdownSerializer.class)
        private String workDescription;
    }
}
