package com.slamperboom.settings;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import com.slamperboom.exceptions.UserException;

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
            String message = "Error while creating dynamic settings instance";
            StartupExceptionHolder.addException(message);
            throw new StartupException(message, e);
        }
    }

    public void saveSettings() throws UserException {
        File configDir = new File(CONFIG_DIR);
        File configFile = new File(SAVE_FILE);
        try{
            if (!configDir.exists() && !configDir.mkdir()) {
                throw new IOException("Unable to create config dir");
            }

            if (!configFile.exists() && !configFile.createNewFile()) {
                throw new IOException("Unable to create config file");
            }
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(SAVE_FILE));
            writer.write(settings.toString());
            writer.close();
        } catch (IOException e){
            // TODO Подумать про graceful shutdown
            throw new UserException(ErrorCode.ERROR_WHILE_SAVING_CONFIG, e);
        }
    }

    public String getLocale() {
        return settings.get(LOCALE).asText();
    }

    public void setLocale(String locale) {
        settings.put(LOCALE, locale);
    }
}
