package com.slamperboom.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.resume.blocks.common.ContentType;
import lombok.Getter;

import java.util.List;

@Getter
public class UpdatePayload {
    @JsonProperty("resume_id")
    private String resumeId;

    @JsonProperty("resume_info")
    private JsonNode resumeInfo;

    private List<Content> content;

    @Getter
    public static class Content {
        @JsonProperty("block")
        private ContentType block;
        @JsonProperty("payload")
        private JsonNode payload;
    }

    @Override
    public String toString() {
        return "{" +
                "resumeId='" + resumeId + '\'' +
                ", resumeInfo=" + resumeInfo +
                ", content=" + content +
                '}';
    }
}
