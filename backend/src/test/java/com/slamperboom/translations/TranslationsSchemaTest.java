package com.slamperboom.translations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.slamperboom.managers.TranslationsManager;
import com.slamperboom.resume.saves.IResume;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TranslationsSchemaTest {
    private static final Path ROOT = Path.of("src/main/resources/translations");

    @Test
    void translationFilesMatchSchema() throws Exception {
        List<String> problems = new ArrayList<>();
        for (Path file : TranslationsSync.translationFiles(ROOT)) {
            TranslationsSync.Result result = TranslationsSync.sync(ROOT, file);
            String name = TranslationsSync.displayName(ROOT, file);
            result.added().forEach(key -> problems.add(name + " is missing key \"" + key + "\""));
            problems.addAll(result.warnings());
        }

        assertTrue(problems.isEmpty(), "Translations don't match _schema.json, run ./gradlew syncTranslations:\n"
                + String.join("\n", problems));
    }

    @Test
    void managerLoadsEveryTranslationFile() throws Exception {
        var constructor = TranslationsManager.class.getDeclaredConstructor();
        constructor.setAccessible(true);
        TranslationsManager manager = constructor.newInstance();

        assertEquals(locales("app_translations"), Set.copyOf(manager.getAvailableLocales()));

        ObjectMapper mapper = new ObjectMapper();
        for (String locale : locales("resume_translations")) {
            IResume resume = mock(IResume.class);
            when(resume.getResumeLocale()).thenReturn(locale);
            assertEquals(mapper.readTree(ROOT.resolve("resume_translations").resolve(locale + ".json").toFile()),
                    manager.getResumeTranslations(resume), "resume translations for " + locale);
        }
    }

    private static Set<String> locales(String dir) throws Exception {
        try (Stream<Path> files = Files.list(ROOT.resolve(dir))) {
            return files.map(f -> f.getFileName().toString())
                    .filter(name -> name.endsWith(".json") && !name.startsWith("_"))
                    .map(name -> name.substring(0, name.length() - ".json".length()))
                    .collect(Collectors.toSet());
        }
    }
}
