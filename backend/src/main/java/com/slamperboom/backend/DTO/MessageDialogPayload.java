package com.slamperboom.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Setter;

@Setter
public class MessageDialogPayload {
    @JsonProperty("title")
    private String title;
    @JsonProperty("text")
    private String text;
}
