package com.slamperboom.htmlConvertion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.managers.TempFilesManager;
import com.slamperboom.managers.TranslationsManager;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The help page template renders optional parts of a section (steps, items, tip) only when
 * the translations have them, so a typo in a key name would silently drop text from the page
 * instead of failing. This renders the page for every help locale and checks that every
 * string of every section ended up in the HTML.
 */
class HelpPageRenderingTest {
    private static final Path HELP_TRANSLATIONS_DIR = Path.of("src/main/resources/translations/help_translations");

    private static HTMLConverter htmlConverter;
    private static ObjectMapper objectMapper;

    @BeforeAll
    static void setUpAll() throws Exception {
        var translationsConstructor = TranslationsManager.class.getDeclaredConstructor();
        translationsConstructor.setAccessible(true);
        htmlConverter = new HTMLConverter(
                new FontsManager(new TempFilesManager()),
                new HTMLTemplateManager(),
                translationsConstructor.newInstance());
        objectMapper = new ObjectMapper();
    }

    private static Stream<Path> helpTranslationFiles() throws IOException {
        try (Stream<Path> files = Files.list(HELP_TRANSLATIONS_DIR)) {
            return files.filter(file -> file.getFileName().toString().endsWith(".json"))
                    .filter(file -> !file.getFileName().toString().startsWith("_"))
                    .toList().stream();
        }
    }

    /** Every string value in the tree, in no particular order. */
    private static List<String> texts(JsonNode node) {
        List<String> texts = new ArrayList<>();
        if (node.isTextual()) {
            texts.add(node.asText());
        } else {
            node.forEach(child -> texts.addAll(texts(child)));
        }
        return texts;
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("helpTranslationFiles")
    void renderHelpPage_containsEveryTranslatedString(Path translationFile) throws Exception {
        JsonNode help = objectMapper.readTree(translationFile.toFile()).get("help");

        String html = htmlConverter.renderStaticPage("help_page", help);

        for (String text : texts(help)) {
            assertTrue(html.contains(text.replace("\"", "&quot;")) || html.contains(text),
                    () -> "Rendered help page misses \"" + text + "\"");
        }
    }
}
