package com.slamperboom.settings;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

public class DynamicSettings {
    private static DynamicSettings dynamicSettings;

    public static DynamicSettings getInstance() {
        if (dynamicSettings == null) {
            dynamicSettings = new DynamicSettings();
        }
        return dynamicSettings;
    }

    private static final String SAVE_FILE = "config/config.json";
    private static final String LOCALE = "locale";

    private JsonNode settings;

    private DynamicSettings(){
        try {
            ObjectMapper mapper = new ObjectMapper();
            File settingsFile = new File(SAVE_FILE);
            if (!settingsFile.exists()) {
                settings = mapper.createObjectNode().put(LOCALE, "en");
            } else {
                settings =
                        mapper.readTree(settingsFile);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void saveSettings() {
        try (OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(SAVE_FILE))) {
            writer.write(settings.toString());
        } catch (IOException e){
            throw new RuntimeException(e);
        }
    }

    public String getLocale() {
        return settings.get(LOCALE).asText();
    }
}
