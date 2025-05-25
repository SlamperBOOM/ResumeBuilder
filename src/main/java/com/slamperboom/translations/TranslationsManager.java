package com.slamperboom.translations;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.settings.DynamicSettings;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class TranslationsManager {
    private static TranslationsManager translationsManagerInstance;

    public static TranslationsManager getInstance() {
        if (translationsManagerInstance == null) {
            translationsManagerInstance = new TranslationsManager();
        }
        return translationsManagerInstance;
    }

    private static final String APP_TRANSLATIONS_PATH = "translations/app_translations.json";
    private static final String RESUME_TRANSLATIONS_PATH = "translations/resume_blocks_translations.json";

    private final Map<String, JsonNode> resumeTranslations;
    private final Map<String, JsonNode> appTranslations;

    private TranslationsManager(){
        appTranslations = new HashMap<>();
        resumeTranslations = new HashMap<>();
        try {
            ObjectMapper mapper = new ObjectMapper();

            JsonNode appTranslationsFile = mapper.readTree(ClassLoader.getSystemResourceAsStream(APP_TRANSLATIONS_PATH));
            var appIterator = appTranslationsFile.fields();
            while (appIterator.hasNext()) {
                var entry = appIterator.next();
                appTranslations.put(entry.getKey(), entry.getValue());
            }

            JsonNode resumeTranslationsFile = mapper.readTree(ClassLoader.getSystemResourceAsStream(RESUME_TRANSLATIONS_PATH));
            var resumeIterator = resumeTranslationsFile.fields();
            while (resumeIterator.hasNext()) {
                var entry = resumeIterator.next();
                resumeTranslations.put(entry.getKey(), entry.getValue());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public Locale getCurrentLocale() {
        return new Locale(DynamicSettings.getInstance().getLocale());
    }

    public String getCurrentLocaleString() {
        return DynamicSettings.getInstance().getLocale();
    }

    public JsonNode getResumeTranslations() {
        return resumeTranslations.get(getCurrentLocaleString());
    }

    public JsonNode getAppTranslations() {
        return appTranslations.get(getCurrentLocaleString());
    }
}
