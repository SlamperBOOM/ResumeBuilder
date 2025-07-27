package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.translations.TranslationsManager;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class BDUIBuilder {
    private static final String SCHEMA_KEY = "schema";
    private static final String TRANSLATIONS_KEY = "translations";
    private static final String PAYLOAD_KEY = "payload";

    private final SchemaManager schemaManager = SchemaManager.getInstance();
    private final IResumeManager resumeManager;
    private final ObjectMapper mapper;

    public JsonNode buildMainScreen() {
        ObjectNode result = mapper.createObjectNode();

        result.set(SCHEMA_KEY, schemaManager.getSchema(SchemaType.MAIN_SCREEN));
        result.set(TRANSLATIONS_KEY, TranslationsManager.getInstance().getAppTranslations().get("main_screen"));

        ArrayNode resumes = mapper.createArrayNode();
        for (var simpleResume : resumeManager.getListOfResumes()) {
            resumes.add(mapper.valueToTree(simpleResume));
        }
        result.set(PAYLOAD_KEY, resumes);

        return result;
    }

    public JsonNode buildEditScreen(String resumeId) {
        ObjectNode result = mapper.createObjectNode();

        result.set(SCHEMA_KEY, schemaManager.getSchema(SchemaType.EDIT_SCREEN));
        result.set(TRANSLATIONS_KEY, TranslationsManager.getInstance().getAppTranslations().get("edit_screen"));
        result.set(PAYLOAD_KEY, mapper.valueToTree(resumeManager.getResume(resumeId)));

        return result;
    }

    public JsonNode buildHeader() {
        ObjectNode result = mapper.createObjectNode();

        result.set(SCHEMA_KEY, schemaManager.getSchema(SchemaType.HEADER));
        result.set(TRANSLATIONS_KEY, TranslationsManager.getInstance().getAppTranslations().get("header"));

        return result;
    }
}
