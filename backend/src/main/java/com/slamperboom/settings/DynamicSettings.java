package com.slamperboom.settings;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

public class DynamicSettings {
    private static DynamicSettings settingsInstance;

    public static DynamicSettings getInstance() {
        if (settingsInstance == null) {
            settingsInstance = new DynamicSettings();
        }
        return settingsInstance;
    }

    private static final String CONFIG_DIR = "config/";
    private static final String SAVE_FILE = "config/config.json";

    private static final String LOCALE = "locale";

    private final ObjectNode settings;

    private DynamicSettings(){
        try {
            ObjectMapper mapper = new ObjectMapper();
            File settingsFile = new File(SAVE_FILE);
            if (!settingsFile.exists()) {
                // fill with defaults
                settings = mapper.createObjectNode()
                        .put(LOCALE, "en");
            } else {
                settings =
                        (ObjectNode) mapper.readTree(settingsFile);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void saveSettings() {
        File configDir = new File(CONFIG_DIR);
        File configFile = new File(SAVE_FILE);
        try{
            if (!configDir.exists() && !configDir.mkdir()) {
                System.err.println("Unable to save settings");
                return;
            }

            if (!configFile.exists() && !configFile.createNewFile()) {
                System.err.println("Unable to save settings");
                return;
            }
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(SAVE_FILE));
            writer.write(settings.toString());
            writer.close();
        } catch (IOException e){
            throw new RuntimeException(e);
        }
    }

    public String getLocale() {
        return settings.get(LOCALE).asText();
    }

    public void setLocale(String locale) {
        settings.put(LOCALE, locale);
    }
}
