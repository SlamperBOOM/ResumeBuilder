package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.htmlConverter.HTMLConverter;
import com.slamperboom.htmlConverter.Template;
import com.slamperboom.managers.SchemaManager;
import com.slamperboom.managers.SchemaType;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.settings.DynamicSettings;
import com.slamperboom.managers.TranslationsManager;
import com.slamperboom.utils.ThreadPoolReducer;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.*;

@ApplicationScoped
public class BDUIBuilder {
    private final Logger logger = Logger.getLogger(this.getClass());
    private final SchemaManager schemaManager;
    private final IResumeManager resumeManager;
    private final ObjectMapper objectMapper;
    private final DialogBuilders dialogBuilders;
    private final HTMLConverter htmlConverter;
    private final ThreadPoolReducer<Template, JsonNode> templatesReducer;

    BDUIBuilder(IResumeManager resumeManager, DialogBuilders dialogBuilders, SchemaManager schemaManager, HTMLConverter htmlConverter) {
        this.resumeManager = resumeManager;
        this.dialogBuilders = dialogBuilders;
        this.schemaManager = schemaManager;
        this.objectMapper = new ObjectMapper();
        this.htmlConverter = htmlConverter;
        objectMapper.registerModule(new JavaTimeModule());

        templatesReducer = new ThreadPoolReducer<>();
    }

    private JsonNode handleFailure(String message, Throwable cause) {
        logger.error(message, cause);
        return dialogBuilders.buildMessageDialogWithoutTitle(message);
    }

    public JsonNode buildMainScreen() {
        ObjectNode result = objectMapper.createObjectNode();
        resumeManager.readAllResumes();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.MAIN_SCREEN));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getMainScreenTranslations());

        try {
            ArrayNode resumes = objectMapper.createArrayNode();
            for (var simpleResume : resumeManager.getListOfResumes()) {
                resumes.add(objectMapper.valueToTree(simpleResume));
            }
            result.set(BackendConstants.PAYLOAD_KEY, resumes);
        } catch (UserException e) {
            return handleFailure(e.getMessage(), e);
        }

        logger.info("Built main screen");
        return result;
    }

    public JsonNode buildEditScreen(String resumeId) {
        ObjectNode result = objectMapper.createObjectNode();
        resumeManager.readAllResumes();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.EDIT_SCREEN));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getEditScreenTranslations());

        try {
            ObjectNode payload = objectMapper.createObjectNode();
            IResume resume = resumeManager.getResume(resumeId);
            if (resume == null) {
                throw new UserException(ErrorCode.RESUME_NOT_FOUND);
            }
            payload.set("resume", resume.getJson());
            payload.put("preview", htmlConverter.saveHTMLtoPDFBase64(htmlConverter.processResumeToHTML(resume)));
            result.set(BackendConstants.PAYLOAD_KEY, payload);

            logger.infof("Built edit screen for resume %s", resumeId);
            return result;
        } catch (UserException | IOException e) {
            return handleFailure(e.getMessage(), e);
        }
    }

    public JsonNode buildHeader() {
        ObjectNode result = objectMapper.createObjectNode();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.HEADER));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getHeaderTranslations());

        return result;
    }

    public JsonNode buildLanguageDialog() {
        ObjectNode result = objectMapper.createObjectNode();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.LANGUAGE_DIALOG));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getLanguageDialogTranslations());

        ObjectNode payload = objectMapper.createObjectNode();
        ArrayNode locales = objectMapper.createArrayNode();
        for (String locale: TranslationsManager.getInstance().getAvailableLocales()) {
            locales.add(objectMapper.createObjectNode()
                    .put("locale", locale)
                    .put("key", "locale_" + locale)
            );
        }
        payload.set("locales", locales);
        payload.put("current_locale", DynamicSettings.getInstance().getLocale());
        result.set(BackendConstants.PAYLOAD_KEY, payload);

        return result;
    }

    public JsonNode buildTemplates(String resumeId) {
        ObjectNode result = objectMapper.createObjectNode();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.TEMPLATES));

        var resume = resumeManager.getResume(resumeId);

        if (resume == null) {
            logger.warnf("Resume not found: %s", resumeId);
            return dialogBuilders.buildMessageDialogWithoutTitle(new UserException(ErrorCode.RESUME_NOT_FOUND).getMessage());
        }

        List<JsonNode> nodes;
        try {
            nodes = templatesReducer.reduceTasks(Arrays.stream(Template.values()).toList(), template -> {
                ObjectNode templateNode = objectMapper.createObjectNode();
                templateNode.put("name", template.toString());

                String htmlTemplate;
                try {
                    htmlTemplate = htmlConverter.processResumeToHTMLWithTemplate(resume, template);
                    templateNode.put("preview", htmlConverter.saveHTMLtoPDFBase64(htmlTemplate));
                } catch (UserException | IOException e) {
                    logger.warnf(e, "Unable to create preview for resume %s and template %s", resume.getId(), template.toString());
                    return Optional.empty();
                }
                return Optional.of(templateNode);
            });
        } catch (UserException e) {
            return handleFailure(e.getMessage(), e);
        }
        nodes.sort(Comparator.comparing(o -> o.get("name").asText()));
        result.putArray(BackendConstants.PAYLOAD_KEY).addAll(nodes);

        logger.infof("Built templates for resume %s", resumeId);
        return result;
    }
}
