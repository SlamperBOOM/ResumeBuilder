package com.slamperboom.settings;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;

import java.io.IOException;
import java.util.Objects;

public class Settings {
    private static Settings settingsInstance;

    public static Settings getInstance() {
        if (settingsInstance == null) {
            settingsInstance = new Settings();
        }
        return settingsInstance;
    }

    private static final String DEFAULT_RESUME_NAME = "default_resume_name";
    private static final String RESUME_SAVE_PATH = "save_path";

    private final JsonNode staticSettings;

    private Settings(){
        try {
            ObjectMapper mapper = new ObjectMapper();
            staticSettings =
                    mapper.readTree(new String(Objects.requireNonNull(getClass().getResourceAsStream("/global_settings.json")).readAllBytes()));
        } catch (IOException e) {
            String message = "Error while reading application settings";
            StartupExceptionHolder.addException(message);
            throw new StartupException(message, e);
        }
    }

    public String getDefaultNewResumeName() {return staticSettings.get(DEFAULT_RESUME_NAME).asText();}

    public String getResumeSavePath() {return staticSettings.get(RESUME_SAVE_PATH).asText();}
}
