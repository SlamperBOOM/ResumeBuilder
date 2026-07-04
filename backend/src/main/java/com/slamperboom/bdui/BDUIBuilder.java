package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.backend.BackendConstants;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.htmlConverter.HTMLConverter;
import com.slamperboom.htmlConverter.Template;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.translations.TranslationsManager;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.*;

public class BDUIBuilder {
    private static final int TEMPLATE_COUNT = Template.values().length;
    private final SchemaManager schemaManager = SchemaManager.getInstance();
    private final IResumeManager resumeManager;
    private final ObjectMapper objectMapper;
    private final DialogBuilders dialogBuilders;
    private final ThreadPoolExecutor poolExecutor;

    public BDUIBuilder(IResumeManager resumeManager, ObjectMapper objectMapper, DialogBuilders dialogBuilders) {
        this.resumeManager = resumeManager;
        this.objectMapper = objectMapper;
        this.dialogBuilders = dialogBuilders;

        poolExecutor = (ThreadPoolExecutor) Executors.newFixedThreadPool(TEMPLATE_COUNT);
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
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }

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
            payload.set("resume", resume.getJson());
            payload.put("preview", HTMLConverter.saveHTMLtoPDFBase64(HTMLConverter.processResumeToHTML(resume)));
            result.set(BackendConstants.PAYLOAD_KEY, payload);

            return result;
        } catch (UserException | IOException e) {
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
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
        result.set(BackendConstants.PAYLOAD_KEY, payload);

        return result;
    }

    public JsonNode buildTemplates(String resumeId) {
        ObjectNode result = objectMapper.createObjectNode();

        result.set(BackendConstants.SCHEMA_KEY, schemaManager.getSchema(SchemaType.TEMPLATES));

        var resume = resumeManager.getResume(resumeId);

        if (resume == null) {
            return dialogBuilders.buildMessageDialogWithoutTitle("No resume with this resume_id");
        }

        List<JsonNode> nodes = new ArrayList<>(TEMPLATE_COUNT);
        CountDownLatch latch = new CountDownLatch(TEMPLATE_COUNT);
        for (var template : Template.values()) {
            poolExecutor.execute(() -> {
                ObjectNode templateNode = objectMapper.createObjectNode();
                templateNode.put("name", template.toString());

                String htmlTemplate;
                try {
                    htmlTemplate = HTMLConverter.processResumeToHTMLWithTemplate(resume, template);
                    templateNode.put("preview", HTMLConverter.saveHTMLtoPDFBase64(htmlTemplate));
                } catch (UserException | IOException e) {
                    latch.countDown();
                    throw new RuntimeException(e);
                }
                synchronized (nodes) {
                    nodes.add(templateNode);
                }
                latch.countDown();
            });
        }

        try {
            latch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return dialogBuilders.buildMessageDialogWithoutTitle(e.getMessage());
        }
        nodes.sort(Comparator.comparing(o -> o.get("name").asText()));
        result.putArray(BackendConstants.PAYLOAD_KEY).addAll(nodes);

        return result;
    }
}
