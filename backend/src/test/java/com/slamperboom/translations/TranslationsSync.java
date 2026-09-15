package com.slamperboom.translations;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonPointer;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.core.util.Separators;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

/**
 * Brings every translation file in line with the _schema.json of its directory.
 * Run with {@code ./gradlew syncTranslations}, see src/main/resources/translations/README.md.
 */
public class TranslationsSync {
    static final String SCHEMA_FILE = "_schema.json";

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final ObjectWriter WRITER = MAPPER.writer(new DefaultPrettyPrinter()
            .withObjectIndenter(new DefaultIndenter("    ", System.lineSeparator()))
            .withSeparators(Separators.createDefaultInstance()
                    .withObjectFieldValueSpacing(Separators.Spacing.AFTER)));

    /**
     * @param synced   file content: schema keys in schema order, then keys unknown to the schema
     * @param added    keys that were missing from the file and got an empty value
     * @param warnings problems that need a human: keys not in the schema, object/value mismatches
     */
    public record Result(ObjectNode synced, List<String> added, List<String> warnings) {
    }

    public static void main(String[] args) throws IOException {
        Path root = Path.of(args[0]);
        for (Path file : translationFiles(root)) {
            String name = displayName(root, file);
            Result result = sync(root, file);

            String json = WRITER.writeValueAsString(result.synced()) + System.lineSeparator();
            if (!json.equals(Files.readString(file, StandardCharsets.UTF_8))) {
                Files.writeString(file, json, StandardCharsets.UTF_8);
                System.out.println("Updated " + name);
            }
            result.added().forEach(key -> System.out.println("  added \"" + key + "\""));
            result.warnings().forEach(warning -> System.out.println("WARN: " + warning));
        }
    }

    /** All translation files (every *.json except _schema.json) in the subdirectories of root. */
    public static List<Path> translationFiles(Path root) throws IOException {
        try (Stream<Path> dirs = Files.list(root)) {
            List<Path> files = new ArrayList<>();
            for (Path dir : dirs.filter(Files::isDirectory).toList()) {
                try (Stream<Path> dirFiles = Files.list(dir)) {
                    dirFiles.filter(f -> f.getFileName().toString().endsWith(".json"))
                            .filter(f -> !f.getFileName().toString().startsWith("_"))
                            .forEach(files::add);
                }
            }
            files.sort(Comparator.naturalOrder());
            return files;
        }
    }

    public static Result sync(Path root, Path file) throws IOException {
        JsonNode schema = MAPPER.readTree(file.resolveSibling(SCHEMA_FILE).toFile());
        JsonNode content = MAPPER.readTree(file.toFile());
        Result result = new Result(MAPPER.createObjectNode(), new ArrayList<>(), new ArrayList<>());
        merge(schema, content, JsonPointer.empty(), result.synced(), result, displayName(root, file), keyLines(file));
        return result;
    }

    private static void merge(JsonNode schema, JsonNode content, JsonPointer pointer, ObjectNode target,
                              Result result, String fileName, Map<JsonPointer, Integer> lines) {
        schema.fields().forEachRemaining(entry -> {
            String key = entry.getKey();
            JsonPointer keyPointer = pointer.appendProperty(key);
            JsonNode schemaValue = entry.getValue();
            JsonNode value = content == null ? null : content.get(key);

            if (value == null) {
                if (schemaValue.isObject()) {
                    merge(schemaValue, null, keyPointer, target.putObject(key), result, fileName, lines);
                } else {
                    target.set(key, TextNode.valueOf(""));
                    result.added().add(keyName(keyPointer));
                }
            } else if (schemaValue.isObject() != value.isObject()) {
                target.set(key, value);
                result.warnings().add(String.format(
                        "%s:%d key \"%s\" is %s in the schema but %s in this file. " +
                                "Fix the file or %s and run syncTranslations again.",
                        fileName, lines.get(keyPointer), keyName(keyPointer),
                        schemaValue.isObject() ? "an object" : "a value",
                        value.isObject() ? "an object" : "a value",
                        SCHEMA_FILE));
            } else if (schemaValue.isObject()) {
                merge(schemaValue, value, keyPointer, target.putObject(key), result, fileName, lines);
            } else {
                target.set(key, value);
            }
        });

        if (content == null) {
            return;
        }
        content.fields().forEachRemaining(entry -> {
            if (schema.has(entry.getKey())) {
                return;
            }
            JsonPointer keyPointer = pointer.appendProperty(entry.getKey());
            target.set(entry.getKey(), entry.getValue());
            result.warnings().add(String.format(
                    "%s:%d key \"%s\" is not in the schema. " +
                            "Remove it if it is not needed, or add it to %s and run syncTranslations again.",
                    fileName, lines.get(keyPointer), keyName(keyPointer), SCHEMA_FILE));
        });
    }

    /** Line number of every key in the file, the tree model doesn't keep them. */
    private static Map<JsonPointer, Integer> keyLines(Path file) throws IOException {
        Map<JsonPointer, Integer> lines = new HashMap<>();
        try (JsonParser parser = MAPPER.createParser(file.toFile())) {
            JsonToken token;
            while ((token = parser.nextToken()) != null) {
                if (token == JsonToken.FIELD_NAME) {
                    lines.put(parser.getParsingContext().pathAsPointer(), parser.currentTokenLocation().getLineNr());
                }
            }
        }
        return lines;
    }

    private static String keyName(JsonPointer pointer) {
        return pointer.toString().substring(1).replace('/', '.');
    }

    static String displayName(Path root, Path file) {
        return root.relativize(file).toString().replace('\\', '/');
    }
}
