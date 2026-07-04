package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;

import java.io.IOException;
import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;

public class SchemaManager {
    private static SchemaManager schemaManagerInstance;

    public static SchemaManager getInstance() {
        if (schemaManagerInstance == null) {
            schemaManagerInstance = new SchemaManager();
        }
        return schemaManagerInstance;
    }

    private final Map<SchemaType, JsonNode> schemasMap;

    private SchemaManager(){
        schemasMap = new EnumMap<>(SchemaType.class);

        ObjectMapper mapper = new ObjectMapper();
        try {
            schemasMap.put(SchemaType.MAIN_SCREEN,
                    mapper.readTree(new String(
                            Objects.requireNonNull(getClass().getResourceAsStream("/screens/main_schema.json")).readAllBytes()
                    )));
            schemasMap.put(SchemaType.HEADER,
                    mapper.readTree(new String(
                            Objects.requireNonNull(getClass().getResourceAsStream("/screens/header_schema.json")).readAllBytes()
                    )));
            schemasMap.put(SchemaType.EDIT_SCREEN,
                    mapper.readTree(new String(
                            Objects.requireNonNull(getClass().getResourceAsStream("/screens/edit_schema.json")).readAllBytes()
                    )));
            schemasMap.put(SchemaType.LANGUAGE_DIALOG,
                    mapper.readTree(new String(
                            Objects.requireNonNull(getClass().getResourceAsStream("/screens/language_dialog_schema.json")).readAllBytes()
                    )));
            schemasMap.put(SchemaType.TEMPLATES,
                    mapper.readTree(new String(
                            Objects.requireNonNull(getClass().getResourceAsStream("/screens/templates_schema.json")).readAllBytes()
                    )));
        } catch (IOException e) {
            String message = "Unable to read schemas";
            StartupExceptionHolder.addException(message);
            throw new StartupException(message);
        }
    }

    public JsonNode getSchema(SchemaType type) {
        return schemasMap.get(type);
    }
}
