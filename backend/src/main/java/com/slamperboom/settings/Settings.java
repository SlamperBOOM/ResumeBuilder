package com.slamperboom.settings;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class Settings {
    private static Settings settingsInstance;

    public static Settings getInstance() {
        if (settingsInstance == null) {
            settingsInstance = new Settings();
        }
        return settingsInstance;
    }

    private static final String VERSION = "current_version";

    private final JsonNode staticSettings;

    private Settings(){
        try {
            ObjectMapper mapper = new ObjectMapper();
            staticSettings =
                    mapper.readTree(new String(Objects.requireNonNull(getClass().getResourceAsStream("/global_settings.json")).readAllBytes()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String getVersion() {
        return staticSettings.get(VERSION).asText();
    }
}
