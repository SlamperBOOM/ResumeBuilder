package com.slamperboom.backend.bduAction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.backend.DTO.ExportPayload;
import com.slamperboom.backend.DTO.UpdatePayload;
import com.slamperboom.backend.FrontendAction;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.settings.DynamicSettings;
import com.slamperboom.translations.TranslationsManager;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;

import java.awt.*;
import java.io.IOException;
import java.util.Optional;

@RequiredArgsConstructor
public class BDUActionPerformer {
    private final Logger logger = Logger.getLogger(this.getClass());

    private final IResumeManager resumeManager;
    private final ObjectMapper objectMapper;

    public JsonNode performCreateNew() {
        String resumeName = TranslationsManager.getInstance().getAppTranslations().get("common").get("new_resume_name").asText();
        String resumeId = resumeManager.createResume(resumeName);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_EDIT_SCREEN.toString())
                .set(BackendConstants.PAYLOAD_KEY, objectMapper.createObjectNode().put(BackendConstants.RESUME_ID_KEY, resumeId));
    }

    public JsonNode performLoad(String resumeId) {
        logger.infof("Loading resume with id %s", resumeId);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_EDIT_SCREEN.toString())
                .set(BackendConstants.PAYLOAD_KEY, objectMapper.createObjectNode().put(BackendConstants.RESUME_ID_KEY, resumeId));
    }

    public JsonNode performOpenMainScreen(String resumeId) {
        resumeManager.saveResume(resumeId);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
    }

    public JsonNode performUpdate(UpdatePayload payload) {
        String resumeId = payload.getResumeId();
        IResume resume = resumeManager.getResume(resumeId);
        if (payload.getResumeInfo() != null) {
            resume.updateResumeInformation(payload.getResumeInfo());
        }
        for (UpdatePayload.Content block: payload.getContent()) {
            resume.updateContent(block.getBlock(), block.getPayload());
        }
        resumeManager.saveResume(resumeId);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.UPDATE_CURRENT_SCREEN.toString());
    }

    public JsonNode performDelete(String resumeId) {
        resumeManager.deleteResume(resumeId);
        logger.infof("Deleting resume with id %s", resumeId);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
    }

    public JsonNode performDuplicate(String resumeId) {
        String newResumeId = resumeManager.duplicateResume(resumeId);
        logger.infof("Duplicating resume with id %s. New resume id %s", resumeId, newResumeId);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_MAIN_SCREEN.toString());
    }

    public Optional<JsonNode> performExport(ExportPayload payload) {
        try {
            resumeManager.exportResumeToPDF(payload.getResumeId(), payload.getSavePath());
            logger.infof("Exporting resume with id %s to PDF. PDF file located at %s", payload.getResumeId(), payload.getSavePath());
            //Desktop.getDesktop().open(new File(payload.getSavePath()).getParentFile());
        } catch (IOException e) {
            e.printStackTrace();
            return Optional.of(constructError("Unable to save to pdf"));
        }
        return Optional.empty();
    }

    public void performOpenSaveDir() {
        try {
            Desktop.getDesktop().open(resumeManager.getSaveFolder());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public JsonNode performChangeLocale(String locale) {
        DynamicSettings.getInstance().setLocale(locale);
        DynamicSettings.getInstance().saveSettings();
        logger.debugf("Locale changed to %s", locale);
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.UPDATE_CURRENT_SCREEN.toString());
    }

    public JsonNode performGetLocales() {
        logger.debug("Get available locales");
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.LOCALE_DIALOG.toString());
    }

    public JsonNode performOpenAbout() {
        logger.info("Show about");
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.OPEN_ABOUT.toString())
                .put(BackendConstants.PAYLOAD_KEY, "Hello about");
    }

    public JsonNode performExit() {
        resumeManager.saveAll();
        DynamicSettings.getInstance().saveSettings();
        logger.info("Perform exit, save all resumes and settings");
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.CLOSE.toString());
    }

    private JsonNode constructError(String message) {
        ObjectNode errorNode = objectMapper.createObjectNode();
        errorNode.put(BackendConstants.FRONTEND_ACTION_KEY, FrontendAction.SHOW_ALERT.toString());
        errorNode.set(BackendConstants.PAYLOAD_KEY, objectMapper.createObjectNode().put("error_message", message));
        return errorNode;
    }
}
