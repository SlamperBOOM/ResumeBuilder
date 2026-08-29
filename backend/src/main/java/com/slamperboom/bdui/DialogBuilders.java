package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.backend.DTO.ConfirmationDialogPayload;
import com.slamperboom.backend.DTO.CustomDialogPayload;
import com.slamperboom.backend.DTO.MessageDialogPayload;
import com.slamperboom.backend.FrontendAction;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DialogBuilders {
    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode makeDialogNode(FrontendAction action, JsonNode payload) {
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, action.toString())
                .set(BackendConstants.PAYLOAD_KEY, payload);
    }

    public JsonNode buildMessageDialogWithoutTitle(String text) {
        return buildMessageDialogWithTitle(null, text);
    }

    public JsonNode buildMessageDialogWithTitle(String title, String text) {
        MessageDialogPayload payload = new MessageDialogPayload();
        payload.setTitle(title);
        payload.setText(text);
        return makeDialogNode(FrontendAction.SHOW_MESSAGE, objectMapper.valueToTree(payload));
    }

    public JsonNode buildConfirmationDialog(ConfirmationDialogPayload payload) {
        return makeDialogNode(FrontendAction.SHOW_CONFIRMATION, objectMapper.valueToTree(payload));
    }

    public JsonNode buildCustomDialog(CustomDialogPayload payload) {
        return makeDialogNode(FrontendAction.SHOW_CUSTOM_DIALOG, objectMapper.valueToTree(payload));
    }
}
