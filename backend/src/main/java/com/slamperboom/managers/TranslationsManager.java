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

    private static final String APP_TRANSLATIONS_PATH = "translations/app_translations";
    private static final String RESUME_TRANSLATIONS_PATH = "translations/resume_translations";
    private static final String HELP_TRANSLATIONS_PATH = "translations/help_translations";
    private static final String TRANSLATIONS_EXTENSION = ".json";
    private static final String DEFAULT_LOCALE = "en";

    private static final String COMMON_KEY = "common";
    private static final String MAIN_SCREEN_KEY = "main_screen";
    private static final String HEADER_KEY = "header";
    private static final String EDIT_SCREEN_KEY = "edit_screen";
    private static final String LANGUAGE_DIALOG_KEY = "language_dialog";
    private static final String CONFIRMATION_DIALOG_KEY = "confirmation_dialog";
    private static final String ERROR_MESSAGES_KEY = "error_messages";
    private static final String HELP_KEY = "help";
    private static final String ONBOARDING_KEY = "onboarding";
    private static final String ABOUT_KEY = "about";

    private final Map<String, JsonNode> resumeTranslations;
    private final Map<String, JsonNode> appTranslations;
    private final Map<String, JsonNode> helpTranslations;

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
        helpTranslations = new HashMap<>();
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

            for (ResourceFiles.ResourceFile file : readTranslationFiles(HELP_TRANSLATIONS_PATH)) {
                helpTranslations.put(localeOf(file), mapper.readTree(file.content()));
            }

            if (!appTranslations.containsKey(DEFAULT_LOCALE) || !resumeTranslations.containsKey(DEFAULT_LOCALE)
                    || !helpTranslations.containsKey(DEFAULT_LOCALE)) {
                throw new IOException("Translations for default locale \"" + DEFAULT_LOCALE + "\" not found");
            }
        } catch (IOException e) {
            String message = "Error while creating translations manager instance";
            StartupExceptionHolder.addException(message);
            throw new StartupException(message, e);
        }
    }

    private JsonNode getAppSection(String key) {
        String currentLocale = getCurrentLocaleString();
        JsonNode localeTranslations = appTranslations.get(currentLocale);
        if (localeTranslations == null) {
            logger.warnf("Unknown locale \"%s\" for app translations, fallback to \"en\"", currentLocale);
            localeTranslations = appTranslations.get(DEFAULT_LOCALE);
        }
        JsonNode section = localeTranslations.get(key);
        if (section == null) {
            logger.warnf("Missing translation section \"%s\" for locale \"%s\"", key, currentLocale);
            return null;
        }

        JsonNode common = localeTranslations.get(COMMON_KEY);
        if (COMMON_KEY.equals(key) || common == null || !(section instanceof ObjectNode)) {
            return section;
        }
        ObjectNode result = common.deepCopy();
        result.setAll((ObjectNode) section);
        return result;
    }

    private JsonNode getHelpSection(String key) {
        String currentLocale = getCurrentLocaleString();
        if (helpTranslations.containsKey(currentLocale)) {
            return helpTranslations.get(currentLocale).get(key);
        }
        logger.warnf("Unknown locale \"%s\" for help translations, fallback to \"en\"", currentLocale);
        return helpTranslations.get(DEFAULT_LOCALE).get(key);
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

    public JsonNode getMainScreenTranslations() {
        return getAppSection(MAIN_SCREEN_KEY);
    }

    public JsonNode getEditScreenTranslations() {
        return getAppSection(EDIT_SCREEN_KEY);
    }

    public JsonNode getHeaderTranslations() {
        return getAppSection(HEADER_KEY);
    }

    public JsonNode getLanguageDialogTranslations() {
        return getAppSection(LANGUAGE_DIALOG_KEY);
    }

    public JsonNode getConfirmationDialogTranslations() {
        return getAppSection(CONFIRMATION_DIALOG_KEY);
    }

    public JsonNode getErrorMessagesTranslations() {
        return getAppSection(ERROR_MESSAGES_KEY);
    }

    public JsonNode getHelpTranslations() {
        return getHelpSection(HELP_KEY);
    }

    public JsonNode getOnboardingTranslations() {
        return getHelpSection(ONBOARDING_KEY);
    }

    public JsonNode getAboutTranslations() {
        return getHelpSection(ABOUT_KEY);
    }
}
