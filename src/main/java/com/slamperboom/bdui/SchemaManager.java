package com.slamperboom.bdui;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
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
        schemasMap = new HashMap<>();

        ObjectMapper mapper = new ObjectMapper();
        try {
            schemasMap.put(SchemaType.MAIN_SCREEN,
                    mapper.readTree(new String(
                            Objects.requireNonNull(ClassLoader.getSystemResourceAsStream("screens/main_schema.json")).readAllBytes()
                    )));
            schemasMap.put(SchemaType.HEADER,
                    mapper.readTree(new String(
                            Objects.requireNonNull(ClassLoader.getSystemResourceAsStream("screens/header_schema.json")).readAllBytes()
                    )));
            schemasMap.put(SchemaType.EDIT_SCREEN,
                    mapper.readTree(new String(
                            Objects.requireNonNull(ClassLoader.getSystemResourceAsStream("screens/edit_schema.json")).readAllBytes()
                    )));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public JsonNode getSchema(SchemaType type) {
        return schemasMap.get(type);
    }
}
