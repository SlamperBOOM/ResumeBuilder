package com.slamperboom.backend.bduAction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.frontend.FrontendAction;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.settings.Constants;
import com.slamperboom.settings.DynamicSettings;
import com.slamperboom.translations.TranslationsManager;
import lombok.RequiredArgsConstructor;

import java.awt.*;
import java.io.IOException;

@RequiredArgsConstructor
public class BDUActionPerformer {
    private static final String FRONTEND_ACTION_KEY = "frontend_action";

    private final IResumeManager resumeManager;
    private final ObjectMapper objectMapper;

    public JsonNode performCreateNew() {
        String resumeName = TranslationsManager.getInstance().getAppTranslations().get("new_resume_name").asText();
        String resumeId = resumeManager.createResume(resumeName);
        return objectMapper.createObjectNode()
                .put(FRONTEND_ACTION_KEY, FrontendAction.OPEN_EDIT_SCREEN.toString())
                .put(Constants.RESUME_ID_KEY, resumeId);
    }

    public JsonNode performLoad(JsonNode payload) {
        String resumeId = payload.get(Constants.RESUME_ID_KEY).asText();
        return objectMapper.createObjectNode()
                .put(FRONTEND_ACTION_KEY, FrontendAction.OPEN_EDIT_SCREEN.toString())
                .put(Constants.RESUME_ID_KEY, resumeId);
    }

    public JsonNode performUpdate(JsonNode payload) {
        String resumeId = payload.get(Constants.RESUME_ID_KEY).asText();
        IResume resume = resumeManager.getResume(resumeId);
        if (payload.has("resume_info")) {
            resume.updateResumeInformation(payload.get("resume_info"));
        } else {
            resume.updateContent(ContentType.valueOf(payload.get("block").asText()), payload.get("content"));
        }
        resumeManager.saveResume(resumeId);
        return objectMapper.createObjectNode()
                .put(FRONTEND_ACTION_KEY, FrontendAction.UPDATE_CURRENT_SCREEN.toString());
    }

    public JsonNode performDelete(JsonNode payload) {
        String resumeId = payload.get(Constants.RESUME_ID_KEY).asText();
        resumeManager.deleteResume(resumeId);
        return objectMapper.createObjectNode()
                .put(FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
    }

    public JsonNode performDuplicate(JsonNode payload) {
        String resumeId = payload.get(Constants.RESUME_ID_KEY).asText();
        resumeManager.duplicateResume(resumeId);
        return objectMapper.createObjectNode()
                .put(FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
    }

    public void performOpenSaveDir() {
        try {
            Desktop.getDesktop().open(resumeManager.getSaveFolder());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public JsonNode performChangeLocale(JsonNode payload) {
        DynamicSettings.getInstance().setLocale(payload.get("locale").asText());
        return objectMapper.createObjectNode()
                .put(FRONTEND_ACTION_KEY, FrontendAction.UPDATE_CURRENT_SCREEN.toString());
    }

    public JsonNode performExit() {
        resumeManager.saveAll();
        DynamicSettings.getInstance().saveSettings();
        return objectMapper.createObjectNode()
                .put(FRONTEND_ACTION_KEY, FrontendAction.CLOSE.toString());
    }

    private JsonNode constructError(String message) {
        ObjectNode errorNode = objectMapper.createObjectNode();
        errorNode.put("message", message);
        return errorNode;
    }
}
