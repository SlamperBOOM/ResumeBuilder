package com.slamperboom.translations;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.settings.DynamicSettings;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.*;

public class TranslationsManager {
    private final Logger logger = Logger.getLogger(this.getClass());
    private static TranslationsManager translationsManagerInstance;

    public static TranslationsManager getInstance() {
        if (translationsManagerInstance == null) {
            translationsManagerInstance = new TranslationsManager();
        }
        return translationsManagerInstance;
    }

    private static final String APP_TRANSLATIONS_PATH = "/translations/app_translations.json";
    private static final String RESUME_TRANSLATIONS_PATH = "/translations/resume_blocks_translations.json";
    private static final String DEFAULT_LOCALE = "en";

    private static final String MAIN_SCREEN_KEY = "main_screen";
    private static final String HEADER_KEY = "header";
    private static final String EDIT_SCREEN_KEY = "edit_screen";
    private static final String LANGUAGE_DIALOG_KEY = "language_dialog";
    private static final String CONFIRMATION_DIALOG_KEY = "confirmation_dialog";
    private static final String ERROR_MESSAGES_KEY = "error_messages";

    private final Map<String, JsonNode> resumeTranslations;
    private final Map<String, JsonNode> appTranslations;

    private static JsonNode flatten(JsonNode rootNode) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode result = mapper.createObjectNode();

        flattenNode("", rootNode, result);

        return result;
    }

    private static void flattenNode(String prefix, JsonNode node, ObjectNode result) {
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();

                String newPrefix = prefix.isEmpty()
                        ? entry.getKey()
                        : prefix + "." + entry.getKey();

                flattenNode(newPrefix, entry.getValue(), result);
            }
        } else if (node.isArray()) {
            for (int i = 0; i < node.size(); i++) {
                String newPrefix = prefix + "[" + i + "]";
                flattenNode(newPrefix, node.get(i), result);
            }
        } else {
            result.set(prefix, node);
        }
    }

    private TranslationsManager(){
        appTranslations = new HashMap<>();
        resumeTranslations = new HashMap<>();
        try {
            ObjectMapper mapper = new ObjectMapper();

            JsonNode appTranslationsFile = mapper.readTree(getClass().getResourceAsStream(APP_TRANSLATIONS_PATH));
            var appIterator = appTranslationsFile.fields();
            while (appIterator.hasNext()) {
                var entry = appIterator.next();
                ObjectNode screenNode = mapper.createObjectNode();
                for (Iterator<Map.Entry<String, JsonNode>> it = entry.getValue().fields(); it.hasNext(); ) {
                    var screen = it.next();
                    screenNode.set(screen.getKey(), flatten(screen.getValue()));
                }
                appTranslations.put(entry.getKey(), screenNode);
            }

            JsonNode resumeTranslationsFile = mapper.readTree(getClass().getResourceAsStream(RESUME_TRANSLATIONS_PATH));
            var resumeIterator = resumeTranslationsFile.fields();
            while (resumeIterator.hasNext()) {
                var entry = resumeIterator.next();
                resumeTranslations.put(entry.getKey(), entry.getValue());
            }
        } catch (IOException e) {
            String message = "Error while creating translations manager instance";
            StartupExceptionHolder.addException(message);
            throw new StartupException(message, e);
        }
    }

    public List<String> getAvailableLocales() {
        return appTranslations.keySet().stream().toList();
    }

    public Locale getCurrentLocale() {
        return new Locale(DynamicSettings.getInstance().getLocale());
    }

    public String getCurrentLocaleString() {
        return DynamicSettings.getInstance().getLocale();
    }

    public JsonNode getResumeTranslations(IResume resume) {
        String currentLocale = resume.getResumeLocale();
        if (resumeTranslations.containsKey(currentLocale)) {
            return resumeTranslations.get(currentLocale);
        }
        logger.warnf("Unknown locale \"{}\" for resume translations, fallback to \"en\"", currentLocale);
        return resumeTranslations.get(DEFAULT_LOCALE);
    }

    private JsonNode getAppTranslations() {
        String currentLocale = getCurrentLocaleString();
        if (appTranslations.containsKey(currentLocale)) {
            return appTranslations.get(currentLocale);
        }
        logger.warnf("Unknown locale \"{}\" for app translations, fallback to \"en\"", currentLocale);
        return appTranslations.get(DEFAULT_LOCALE);
    }

    public JsonNode getMainScreenTranslations() {
        return getAppTranslations().get(MAIN_SCREEN_KEY);
    }

    public JsonNode getEditScreenTranslations() {
        return getAppTranslations().get(EDIT_SCREEN_KEY);
    }

    public JsonNode getHeaderTranslations() {
        return getAppTranslations().get(HEADER_KEY);
    }

    public JsonNode getLanguageDialogTranslations() {
        return getAppTranslations().get(LANGUAGE_DIALOG_KEY);
    }

    public JsonNode getConfirmationDialogTranslations() {
        return getAppTranslations().get(CONFIRMATION_DIALOG_KEY);
    }

    public JsonNode getErrorMessagesTranslations() {
        return getAppTranslations().get(ERROR_MESSAGES_KEY);
    }
}
