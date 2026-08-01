package com.slamperboom.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Setter;

import java.util.List;

@Setter
public class CustomDialogPayload {
    @JsonProperty("title")
    private String title;
    @JsonProperty("text")
    private String text;
    @JsonProperty("decline_button_text")
    private String declineButtonText;
    @JsonProperty("actions")
    private List<CustomActionButton> actions;

    private static class CustomActionButton {
        @JsonProperty("title")
        private String title;
        @JsonProperty("action")
        private String action;
        @JsonProperty("action_payload")
        private JsonNode actionPayload;
    }
}
