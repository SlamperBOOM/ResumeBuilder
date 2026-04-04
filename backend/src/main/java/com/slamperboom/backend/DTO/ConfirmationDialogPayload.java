package com.slamperboom.backend.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Setter;

@Setter
public class ConfirmationDialogPayload {
    @JsonProperty("title")
    private String title;
    @JsonProperty("text")
    private String text;
    @JsonProperty("confirm_button_text")
    private String confirmButtonText;
    @JsonProperty("decline_button_text")
    private String declineButtonText;
    @JsonProperty("confirm_action")
    private String confirmAction;
    @JsonProperty("confirm_action_payload")
    private JsonNode confirmActionPayload;
}
