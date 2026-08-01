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

    public JsonNode buildMessageDialogWithoutTitle(String text) {
        return buildMessageDialogWithTitle(null, text);
    }

    public JsonNode buildMessageDialogWithTitle(String title, String text) {
        ObjectNode messageNode = objectMapper.createObjectNode();
        messageNode.put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.SHOW_MESSAGE.toString());
        MessageDialogPayload payload = new MessageDialogPayload();
        payload.setTitle(title);
        payload.setText(text);
        messageNode.set(BackendConstants.PAYLOAD_KEY, objectMapper.valueToTree(payload));
        return messageNode;
    }

    public JsonNode buildConfirmationDialog(ConfirmationDialogPayload payload) {
        ObjectNode confirmationNode = objectMapper.createObjectNode();
        confirmationNode.put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.SHOW_CONFIRMATION.toString());
        confirmationNode.set(BackendConstants.PAYLOAD_KEY, objectMapper.valueToTree(payload));
        return confirmationNode;
    }

    public JsonNode buildCustomDialog(CustomDialogPayload payload) {
        ObjectNode customDialogNode = objectMapper.createObjectNode();
        customDialogNode.put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.SHOW_CUSTOM_DIALOG.toString());
        customDialogNode.set(BackendConstants.PAYLOAD_KEY, objectMapper.valueToTree(payload));
        return customDialogNode;
    }
}
