package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.htmlConverter.HTMLConverter;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.translations.TranslationsManager;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class BDUIBuilder {
    private final SchemaManager schemaManager = SchemaManager.getInstance();
    private final IResumeManager resumeManager;
    private final ObjectMapper objectMapper;

    public JsonNode buildMainScreen() {
        ObjectNode result = objectMapper.createObjectNode();
        resumeManager.readAllResumes();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.MAIN_SCREEN));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getAppTranslations().get("main_screen"));

        ArrayNode resumes = objectMapper.createArrayNode();
        for (var simpleResume : resumeManager.getListOfResumes()) {
            resumes.add(objectMapper.valueToTree(simpleResume));
        }
        result.set(BackendConstants.PAYLOAD_KEY, resumes);

        return result;
    }

    public JsonNode buildEditScreen(String resumeId) {
        ObjectNode result = objectMapper.createObjectNode();
        resumeManager.readAllResumes();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.EDIT_SCREEN));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getAppTranslations().get("edit_screen"));

        ObjectNode payload = objectMapper.createObjectNode();
        IResume resume = resumeManager.getResume(resumeId);
        payload.set("resume", resume.getJson());
        payload.put("preview", HTMLConverter.processHTMLTemplate(resume));
        result.set(BackendConstants.PAYLOAD_KEY, payload);

        return result;
    }

    public JsonNode buildHeader() {
        ObjectNode result = objectMapper.createObjectNode();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.HEADER));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getAppTranslations().get("header"));

        return result;
    }

    public JsonNode buildLanguageDialog() {
        ObjectNode result = objectMapper.createObjectNode();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.LANGUAGE_DIALOG));
        result.set(BackendConstants.TRANSLATIONS_KEY, TranslationsManager.getInstance().getAppTranslations().get("language_dialog"));

        ObjectNode payload = objectMapper.createObjectNode();
        ArrayNode locales = objectMapper.createArrayNode();
        for (String locale: TranslationsManager.getInstance().getAvailableLocales()) {
            locales.add(objectMapper.createObjectNode()
                    .put("locale", locale)
                    .put("key", "locale_" + locale)
            );
        }
        payload.set("locales", locales);
        result.set(BackendConstants.PAYLOAD_KEY, payload);

        return result;
    }
}
