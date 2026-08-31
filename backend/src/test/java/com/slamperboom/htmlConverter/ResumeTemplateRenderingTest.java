package com.slamperboom.htmlConverter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.managers.TempFilesManager;
import com.slamperboom.resume.saves.Resume;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Base64;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Golden-file (byte-for-byte) tests for {@link HTMLConverter} rendering. Covers every
 * combination of the sample resumes in {@code src/test/resources/sample_resumes/} and every
 * {@link Template}, comparing the full rendered HTML and PDF against committed golden files.
 * <p>
 * This class lives in the same package as {@link HTMLConverter}, {@link HTMLTemplateManager}
 * and {@link FontsManager} so it can call their package-private constructors directly,
 * without going through CDI/{@code @QuarkusTest}.
 * <p>
 * PDF output embeds a {@code /CreationDate} taken from {@code Calendar.getInstance()} at
 * render time, which would otherwise make the PDF bytes different on every run. Each test
 * that renders a PDF mocks {@link Calendar#getInstance()} (via {@link MockedStatic}) to
 * return a fixed, frozen date, so the byte-for-byte comparison against the golden file is
 * stable across machines and runs.
 * <p>
 * PDFBox also writes a fresh, random {@code /ID} trailer entry on every save, independent
 * of {@code Calendar}, so it can never be reproduced via mocking alone. {@link #maskDocumentId}
 * neutralizes it by replacing both hex strings with fixed-length zero placeholders before any
 * comparison, so it stops being a source of noise.
 * <p>
 * To (re)generate the golden files, run the tests with {@code -Dgolden.update=true}.
 */
class ResumeTemplateRenderingTest {

    private static final Path SAMPLE_RESUMES_DIR = Path.of("src/test/resources/sample_resumes");
    private static final Path GOLDEN_DIR = Path.of("src/test/resources/golden");
    private static final boolean GOLDEN_UPDATE = Boolean.getBoolean("golden.update");
    private static final String PDF_DATA_URI_PREFIX = "data:application/pdf;base64,";

    private static final String[] FIXTURE_NAMES = {
            "marketing_manager", "graphic_designer", "data_analyst", "senior_software_engineer"
    };

    private static HTMLConverter htmlConverter;
    private static ObjectMapper objectMapper;

    private static Resume loadResume(String fixtureName) throws IOException {
        Path fixturePath = SAMPLE_RESUMES_DIR.resolve(fixtureName + ".json");
        JsonNode json = objectMapper.readTree(fixturePath.toFile());
        return objectMapper.treeToValue(json, Resume.class);
    }

    private static byte[] decodeBase64Pdf(String dataUri) {
        return Base64.getDecoder().decode(dataUri.substring(PDF_DATA_URI_PREFIX.length()));
    }

    private static final Pattern PDF_DOCUMENT_ID_PATTERN =
            Pattern.compile("/ID\\s*\\[\\s*<([0-9A-Fa-f]+)>\\s*<([0-9A-Fa-f]+)>\\s*]");

    /**
     * Neutralizes the PDF trailer's {@code /ID} entry. PDFBox regenerates it as a fresh
     * random value on every save regardless of the mocked {@link Calendar}, so it can never
     * be byte-for-byte reproducible between two renders. Both hex strings are replaced with
     * fixed-length zero placeholders, preserving the surrounding byte layout.
     */
    private static byte[] maskDocumentId(byte[] pdfBytes) {
        String pdfText = new String(pdfBytes, StandardCharsets.ISO_8859_1);
        Matcher matcher = PDF_DOCUMENT_ID_PATTERN.matcher(pdfText);
        StringBuilder masked = new StringBuilder();
        int previousEnd = 0;
        while (matcher.find()) {
            masked.append(pdfText, previousEnd, matcher.start());
            masked.append("/ID [<")
                    .append("0".repeat(matcher.group(1).length()))
                    .append("> <")
                    .append("0".repeat(matcher.group(2).length()))
                    .append(">]");
            previousEnd = matcher.end();
        }
        masked.append(pdfText, previousEnd, pdfText.length());
        return masked.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    /**
     * A fixed point in time, in a fixed time zone, with sub-second precision zeroed out, so
     * the resulting {@code /CreationDate} is byte-identical regardless of which machine or
     * time zone the test runs in.
     */
    private static Calendar fixedCreationDate() {
        Calendar calendar = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
        calendar.set(2026, Calendar.JANUARY, 1, 12, 0, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar;
    }

    private static void assertMatchesGolden(String goldenFileName, byte[] actualBytes) throws IOException {
        Path goldenPath = GOLDEN_DIR.resolve(goldenFileName);
        if (GOLDEN_UPDATE) {
            Files.createDirectories(GOLDEN_DIR);
            Files.write(goldenPath, actualBytes);
            return;
        }
        assertTrue(Files.exists(goldenPath),
                "Golden file " + goldenPath + " does not exist. Run with -Dgolden.update=true to generate it.");
        byte[] expectedBytes = Files.readAllBytes(goldenPath);
        assertArrayEquals(expectedBytes, actualBytes, () -> "Rendered output does not match golden file " + goldenPath
                + "\n" + describeFirstDifference(expectedBytes, actualBytes));
    }

    /**
     * Builds a human-readable description of the first byte at which two arrays diverge,
     * including a window of surrounding bytes decoded as ISO-8859-1 text. PDF structure
     * (dictionaries, the trailer, cross-reference table) is plain ASCII even when content
     * streams are compressed, so this is usually enough to see what actually differs
     * (a date, a generated ID, an object number, a font subset tag, etc.) without needing
     * to guess up front which field to mask.
     */
    private static String describeFirstDifference(byte[] expected, byte[] actual) {
        int minLength = Math.min(expected.length, actual.length);
        int diffIndex = -1;
        for (int i = 0; i < minLength; i++) {
            if (expected[i] != actual[i]) {
                diffIndex = i;
                break;
            }
        }
        if (diffIndex == -1) {
            return "Byte arrays differ only in length: expected " + expected.length
                    + " bytes, actual " + actual.length + " bytes.";
        }
        int contextStart = Math.max(0, diffIndex - 80);
        int contextEnd = Math.min(minLength, diffIndex + 80);
        String expectedContext = new String(expected, contextStart, contextEnd - contextStart, StandardCharsets.ISO_8859_1);
        String actualContext = new String(actual, contextStart, contextEnd - contextStart, StandardCharsets.ISO_8859_1);
        return "First differing byte at index " + diffIndex
                + " (expected=" + expected[diffIndex] + ", actual=" + actual[diffIndex] + ").\n"
                + "--- expected context ---\n" + expectedContext + "\n"
                + "--- actual context ---\n" + actualContext;
    }

    @BeforeAll
    static void setUpAll() {
        HTMLTemplateManager htmlTemplateManager = new HTMLTemplateManager();
        FontsManager fontsManager = new FontsManager(new TempFilesManager());
        htmlConverter = new HTMLConverter(fontsManager, htmlTemplateManager);

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    private static Stream<Arguments> resumeAndTemplateCombinations() {
        return Arrays.stream(FIXTURE_NAMES)
                .flatMap(fixtureName -> Arrays.stream(Template.values())
                        .map(template -> Arguments.of(fixtureName, template)));
    }

    @ParameterizedTest(name = "{0} + {1}")
    @MethodSource("resumeAndTemplateCombinations")
    void renderResumeWithTemplate_matchesGoldenHtmlAndPdf(String fixtureName, Template template) throws Exception {
        Resume resume = loadResume(fixtureName);
        String html = htmlConverter.processResumeToHTMLWithTemplate(resume, template);
        String goldenBaseName = fixtureName + "_" + template;

        assertMatchesGolden(goldenBaseName + ".html", html.getBytes(StandardCharsets.UTF_8));

        try (MockedStatic<Calendar> calendarMock = Mockito.mockStatic(Calendar.class, Mockito.CALLS_REAL_METHODS)) {
            calendarMock.when(Calendar::getInstance).thenAnswer(invocation -> fixedCreationDate());
            byte[] pdfBytes = maskDocumentId(decodeBase64Pdf(htmlConverter.saveHTMLtoPDFBase64(html)));
            assertMatchesGolden(goldenBaseName + ".pdf", pdfBytes);
        }
    }

    @Test
    void renderingSameResumeTwice_withFrozenClock_producesByteIdenticalPdf() throws Exception {
        // /CreationDate is neutralized via the Calendar mock and /ID via maskDocumentId - this
        // catches any *other* source of PDF non-determinism without needing a golden file.
        Resume resume = loadResume("senior_software_engineer");
        String html = htmlConverter.processResumeToHTMLWithTemplate(resume, Template.SIMPLE_TEMPLATE_UPDATED);

        try (MockedStatic<Calendar> calendarMock = Mockito.mockStatic(Calendar.class, Mockito.CALLS_REAL_METHODS)) {
            calendarMock.when(Calendar::getInstance).thenAnswer(invocation -> fixedCreationDate());

            byte[] firstRender = maskDocumentId(decodeBase64Pdf(htmlConverter.saveHTMLtoPDFBase64(html)));
            byte[] secondRender = maskDocumentId(decodeBase64Pdf(htmlConverter.saveHTMLtoPDFBase64(html)));

            assertArrayEquals(firstRender, secondRender, () -> "PDF rendering is not deterministic even with a "
                    + "frozen Calendar and masked /ID - look for another non-deterministic field and mask it.\n"
                    + describeFirstDifference(firstRender, secondRender));
        }
    }

    @Test
    void saveHTMLtoPDF_fileVariant_producesSameBytesAsBase64Variant(@TempDir Path tempDir) throws Exception {
        // Not part of the 16-combo golden matrix since it shares renderToStream() with the
        // base64 variant - this only checks the file-writing entry point stays in lockstep.
        Resume resume = loadResume("marketing_manager");
        String html = htmlConverter.processResumeToHTMLWithTemplate(resume, Template.SIMPLE_TEMPLATE);

        try (MockedStatic<Calendar> calendarMock = Mockito.mockStatic(Calendar.class, Mockito.CALLS_REAL_METHODS)) {
            calendarMock.when(Calendar::getInstance).thenAnswer(invocation -> fixedCreationDate());

            byte[] base64Variant = maskDocumentId(decodeBase64Pdf(htmlConverter.saveHTMLtoPDFBase64(html)));

            Path pdfPath = tempDir.resolve("resume.pdf");
            htmlConverter.saveHTMLtoPDF(html, pdfPath.toString());
            byte[] fileVariant = maskDocumentId(Files.readAllBytes(pdfPath));

            assertArrayEquals(base64Variant, fileVariant, () -> "saveHTMLtoPDF(String, String) should produce the "
                    + "exact same bytes as saveHTMLtoPDFBase64().\n"
                    + describeFirstDifference(base64Variant, fileVariant));
        }
    }
}
