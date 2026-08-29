package com.slamperboom.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import jakarta.enterprise.context.ApplicationScoped;

import java.io.IOException;
import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;

@ApplicationScoped
public class SchemaManager {
    private final Map<SchemaType, JsonNode> schemasMap;

    SchemaManager(){
        schemasMap = new EnumMap<>(SchemaType.class);

        ObjectMapper mapper = new ObjectMapper();
        try {
            for (var schema : SchemaType.values()) {
                schemasMap.put(schema, mapper.readTree(new String(
                        Objects.requireNonNull(getClass().getResourceAsStream(schema.getSchemaFilePath())).readAllBytes()
                )));
            }
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
