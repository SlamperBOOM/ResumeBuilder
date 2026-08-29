package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.backend.DTO.ConfirmationDialogPayload;
import com.slamperboom.backend.DTO.ExportPayload;
import com.slamperboom.backend.DTO.UpdatePayload;
import com.slamperboom.backend.FrontendAction;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.settings.DynamicSettings;
import com.slamperboom.settings.Settings;
import com.slamperboom.managers.TranslationsManager;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.util.Optional;

@RequiredArgsConstructor
public class BDUActionPerformer {
    private final Logger logger = Logger.getLogger(this.getClass());

    private final IResumeManager resumeManager;
    private final ObjectMapper objectMapper;
    private final DialogBuilders dialogBuilders;

    private ObjectNode getResumeIdPayload(String resumeId) {
        return objectMapper.createObjectNode().put(BackendConstants.RESUME_ID_KEY, resumeId);
    }

    private JsonNode makeActionNode(FrontendAction action) {
        return objectMapper.createObjectNode().put(BackendConstants.FRONTEND_ACTION_KEY, action.toString());
    }

    private JsonNode makeActionNode(FrontendAction action, JsonNode payload) {
        return objectMapper.createObjectNode()
                .put(BackendConstants.FRONTEND_ACTION_KEY, action.toString())
                .set(BackendConstants.PAYLOAD_KEY, payload);
    }

    public JsonNode performCreateNew() {
        try {
            String resumeName = Settings.getInstance().getDefaultNewResumeName();
            String resumeId = resumeManager.createResume(resumeName);
            return makeActionNode(FrontendAction.OPEN_EDIT_SCREEN, getResumeIdPayload(resumeId));
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performLoad(String resumeId) {
        logger.infof("Loading resume with id %s", resumeId);
        return makeActionNode(FrontendAction.OPEN_EDIT_SCREEN, getResumeIdPayload(resumeId));
    }

    public JsonNode performOpenMainScreen(String resumeId) {
        try {
            resumeManager.saveResume(resumeId);
            return makeActionNode(FrontendAction.OPEN_MAIN_SCREEN);
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performUpdate(UpdatePayload payload) {
        try {
            String resumeId = payload.getResumeId();
            IResume resume = resumeManager.getResume(resumeId);
            if (resume == null) {
                throw new UserException(ErrorCode.RESUME_NOT_FOUND);
            }
            if (payload.getResumeInfo() != null) {
                resume.updateResumeInformation(payload.getResumeInfo());
            }
            for (UpdatePayload.Content block : payload.getContent()) {
                resume.updateContent(block.getBlock(), block.getPayload());
            }
            resumeManager.saveResume(resumeId);
            logger.infof("Updated resume with id %s", resumeId);
            logger.debugf("Update payload: %s", payload);
            return makeActionNode(FrontendAction.UPDATE_CURRENT_SCREEN);
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performDelete(String resumeId) {
        ConfirmationDialogPayload payload = new ConfirmationDialogPayload();
        JsonNode translations = TranslationsManager.getInstance().getConfirmationDialogTranslations();
        IResume resume;
        try {
            resume = resumeManager.getResume(resumeId);
            if (resume == null) {
                throw new UserException(ErrorCode.RESUME_NOT_FOUND);
            }
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }

        payload.setTitle(translations.get("delete_confirmation.title").asText() + resume.getName());
        payload.setText(translations.get("delete_confirmation.text").asText());
        payload.setConfirmButtonText(translations.get("delete_confirmation.confirm_button_text").asText());
        payload.setDeclineButtonText(translations.get("delete_confirmation.decline_button_text").asText());
        payload.setConfirmAction("confirm_delete");
        payload.setConfirmActionPayload(getResumeIdPayload(resumeId));

        return dialogBuilders.buildConfirmationDialog(payload);
    }

    public JsonNode performConfirmDelete(String resumeId) {
        try {
            resumeManager.deleteResume(resumeId);
            logger.infof("Deleting resume with id %s", resumeId);
            return makeActionNode(FrontendAction.OPEN_MAIN_SCREEN);
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performDuplicate(String resumeId) {
        try {
            String newResumeId = resumeManager.duplicateResume(resumeId);
            logger.infof("Duplicating resume with id %s. New resume id: %s", resumeId, newResumeId);
            return makeActionNode(FrontendAction.OPEN_MAIN_SCREEN);
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public Optional<JsonNode> performExport(ExportPayload payload) {
        try {
            resumeManager.exportResumeToPDF(payload.getResumeId(), payload.getSavePath());
            logger.infof("Exporting resume with id %s to PDF. PDF file located at %s", payload.getResumeId(), payload.getSavePath());
        } catch (UserException e) {
            return Optional.of(dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage()));
        }
        ConfirmationDialogPayload confirmPayload = new ConfirmationDialogPayload();
        JsonNode translations = TranslationsManager.getInstance().getConfirmationDialogTranslations();

        confirmPayload.setTitle(translations.get("after_export_confirmation.title").asText());
        confirmPayload.setText(translations.get("after_export_confirmation.text").asText());
        confirmPayload.setConfirmButtonText(translations.get("after_export_confirmation.confirm_button_text").asText());
        confirmPayload.setDeclineButtonText(translations.get("after_export_confirmation.decline_button_text").asText());
        confirmPayload.setConfirmAction("open_local_dir");
        confirmPayload.setConfirmActionPayload(
                objectMapper.createObjectNode().put(
                        "local_dir_path",
                        new File(payload.getSavePath()).getParentFile().getAbsolutePath()
                ));

        return Optional.of(dialogBuilders.buildConfirmationDialog(confirmPayload));
    }

    public JsonNode performImport(String fileName) {
        String resumeId;
        try {
            resumeId = resumeManager.importResumeFromFile(fileName);
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
        return makeActionNode(FrontendAction.OPEN_EDIT_SCREEN, getResumeIdPayload(resumeId));
    }

    public void performOpenSaveDir() {
        performOpenDir(Settings.getInstance().getResumeSavePath());
    }

    public Optional<JsonNode> performOpenDir(String dirPath) {
        try {
            if (!Desktop.isDesktopSupported()) {
                throw new UserException(ErrorCode.UNABLE_TO_PERFORM_ACTION);
            }
            Desktop.getDesktop().open(new File(dirPath));
            logger.info("Open resume dir");
            return Optional.empty();
        } catch (UserException | IOException e) {
            return Optional.of(dialogBuilders.buildMessageDialogWithoutTitle(""));
        }
    }

    public JsonNode performChangeLocale(String locale) {
        try {
            DynamicSettings.getInstance().setLocale(locale);
            DynamicSettings.getInstance().saveSettings();
            logger.debugf("Locale changed to %s", locale);
            return makeActionNode(FrontendAction.UPDATE_CURRENT_SCREEN);
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }

    public JsonNode performGetLocales() {
        logger.debug("Get available locales");
        return makeActionNode(FrontendAction.LOCALE_DIALOG);
    }

    public JsonNode performOpenAbout() {
        logger.info("Show about");
        return makeActionNode(FrontendAction.OPEN_ABOUT, objectMapper.createObjectNode().put("text", "Hello about"));
    }

    public JsonNode performExit() {
        try {
            resumeManager.saveAll();
            DynamicSettings.getInstance().saveSettings();
            logger.info("Perform exit, save all resumes and settings");
            return makeActionNode(FrontendAction.CLOSE);
        } catch (UserException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
    }
}
