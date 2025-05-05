package com.slamperboom.settings;

import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Settings {
    private static Settings settingsInstance;

    public static Settings getInstance() {
        if (settingsInstance == null) {
            settingsInstance = new Settings();
        }
        return settingsInstance;
    }

    private static final String REQUIRED_BLOCKS = "required_blocks";
    private JSONObject settings;

    private Settings(){
        try {
            settings =
                    new JSONObject(new String(ClassLoader.getSystemResourceAsStream("global_settings.json").readAllBytes()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> getRequiredBlocksList() {
        List<String> list = new ArrayList<>();
        for (Object o : settings.getJSONArray(REQUIRED_BLOCKS).toList()) {
            if (o instanceof String string) {
                list.add(string);
            }
        }
        return list;
    }
}
