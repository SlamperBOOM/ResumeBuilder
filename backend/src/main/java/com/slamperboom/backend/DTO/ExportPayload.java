package com.slamperboom.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class ExportPayload {
    @JsonProperty("resume_id")
    private String resumeId;
    @JsonProperty("save_path")
    private String savePath;
}
