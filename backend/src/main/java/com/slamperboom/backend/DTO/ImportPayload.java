package com.slamperboom.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class ImportPayload {
    @JsonProperty("file_name")
    private String fileName;
}
