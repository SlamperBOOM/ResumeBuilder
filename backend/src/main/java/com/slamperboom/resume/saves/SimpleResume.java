package com.slamperboom.resume.saves;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.time.LocalDateTime;

public record SimpleResume(
        @JsonProperty("resume_id") String resumeId,
        @JsonProperty("resume_name") String resumeName,
        @JsonProperty("last_modification_date") @JsonSerialize(using = SimpleResumeDateSerializer.class) LocalDateTime lastModificationDate,
        @JsonProperty("html_preview") String htmlPreview) {
}
