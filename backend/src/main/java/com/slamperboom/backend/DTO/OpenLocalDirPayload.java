package com.slamperboom.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class OpenLocalDirPayload {
    @JsonProperty("dir_path")
    private String dirPath;
}
