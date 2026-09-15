package com.slamperboom.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.settings.DynamicSettings;
import com.slamperboom.utils.ResourceFiles;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.*;

@ApplicationScoped
public class TranslationsManager {
    private final Logger logger = Logger.getLogger(this.getClass());
    private static TranslationsManager translationsManagerInstance;

    private static final String APP_TRANSLATIONS_PATH = "translations/app_translations";
    private static final String RESUME_TRANSLATIONS_PATH = "translations/resume_translations";
    private static final String TRANSLATIONS_EXTENSION = ".json";
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

    // Files starting with "_" (_schema.json) are templates for new languages, not languages
    private static List<ResourceFiles.ResourceFile> readTranslationFiles(String dir) throws IOException {
        return ResourceFiles.read(dir, TRANSLATIONS_EXTENSION).stream()
                .filter(file -> !file.name().startsWith("_"))
                .toList();
    }

    private static String localeOf(ResourceFiles.ResourceFile file) {
        return file.name().substring(0, file.name().length() - TRANSLATIONS_EXTENSION.length());
    }

    TranslationsManager(){
        appTranslations = new HashMap<>();
        resumeTranslations = new HashMap<>();
        try {
            ObjectMapper mapper = new ObjectMapper();

            for (ResourceFiles.ResourceFile file : readTranslationFiles(APP_TRANSLATIONS_PATH)) {
                ObjectNode screenNode = mapper.createObjectNode();
                for (Iterator<Map.Entry<String, JsonNode>> it = mapper.readTree(file.content()).fields(); it.hasNext(); ) {
                    var screen = it.next();
                    screenNode.set(screen.getKey(), flatten(screen.getValue()));
                }
                appTranslations.put(localeOf(file), screenNode);
            }

            for (ResourceFiles.ResourceFile file : readTranslationFiles(RESUME_TRANSLATIONS_PATH)) {
                resumeTranslations.put(localeOf(file), mapper.readTree(file.content()));
            }

            if (!appTranslations.containsKey(DEFAULT_LOCALE) || !resumeTranslations.containsKey(DEFAULT_LOCALE)) {
                throw new IOException("Translations for default locale \"" + DEFAULT_LOCALE + "\" not found");
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
        logger.warnf("Unknown locale \"%s\" for resume translations, fallback to \"en\"", currentLocale);
        return resumeTranslations.get(DEFAULT_LOCALE);
    }

    private JsonNode getAppTranslations() {
        String currentLocale = getCurrentLocaleString();
        if (appTranslations.containsKey(currentLocale)) {
            return appTranslations.get(currentLocale);
        }
        logger.warnf("Unknown locale \"%s\" for app translations, fallback to \"en\"", currentLocale);
        return appTranslations.get(DEFAULT_LOCALE);
    }

    private JsonNode getSection(String key) {
        JsonNode section = getAppTranslations().get(key);
        if (section == null) {
            logger.warnf("Missing translation section \"%s\" for locale \"%s\"", key, getCurrentLocaleString());
        }
        return section;
    }

    public JsonNode getMainScreenTranslations() {
        return getSection(MAIN_SCREEN_KEY);
    }

    public JsonNode getEditScreenTranslations() {
        return getSection(EDIT_SCREEN_KEY);
    }

    public JsonNode getHeaderTranslations() {
        return getSection(HEADER_KEY);
    }

    public JsonNode getLanguageDialogTranslations() {
        return getSection(LANGUAGE_DIALOG_KEY);
    }

    public JsonNode getConfirmationDialogTranslations() {
        return getSection(CONFIRMATION_DIALOG_KEY);
    }

    public JsonNode getErrorMessagesTranslations() {
        return getSection(ERROR_MESSAGES_KEY);
    }
}
