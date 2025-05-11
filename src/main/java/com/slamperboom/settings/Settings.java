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

    private static final String REQUIRED_BLOCKS = "required_blocks";
    private static final String VERSION = "current_version";

    private final JsonNode staticSettings;

    private Settings(){
        try {
            ObjectMapper mapper = new ObjectMapper();
            staticSettings =
                    mapper.readTree(new String(Objects.requireNonNull(ClassLoader.getSystemResourceAsStream("global_settings.json")).readAllBytes()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> getRequiredBlocksList() {
        if (staticSettings.get(REQUIRED_BLOCKS).isArray()) {
            List<String> requiredBlocks = new ArrayList<>();
            var iter = staticSettings.withArrayProperty(REQUIRED_BLOCKS).elements();
            iter.forEachRemaining(o -> requiredBlocks.add(o.asText()));
            return requiredBlocks;
        }
        return Collections.emptyList();
    }

    public String getVersion() {
        return staticSettings.get(VERSION).asText();
    }
}
