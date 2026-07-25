package com.slamperboom.htmlConverter;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import com.slamperboom.utils.TempFilesManager;
import org.apache.fontbox.ttf.NamingTable;
import org.apache.fontbox.ttf.OS2WindowsMetricsTable;
import org.apache.fontbox.ttf.TTFParser;
import org.apache.fontbox.ttf.TrueTypeFont;
import org.jboss.logging.Logger;

import java.io.*;
import java.net.JarURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Stream;

public class FontsManager {
    private static FontsManager fontsManagerInstance;

    public static FontsManager getInstance() {
        if (fontsManagerInstance == null) {
            try {
                fontsManagerInstance = new FontsManager();
            } catch (IOException e) {
                String message = "Error while reading fonts";
                StartupExceptionHolder.addException(message);
                throw new StartupException(message, e);
            }
        }
        return fontsManagerInstance;
    }

    private static final String fontsPath = "templates/fonts/";
    private static final String[] SUPPORTED_EXTENSIONS = {".ttf", ".otf"};

    private final Logger logger = Logger.getLogger(this.getClass());
    private final List<FontInfo> fonts;

    private String stripExtension(String name) {
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    private void registerFontFile(File file, String originalName) throws IOException {
        try (TrueTypeFont ttf = new TTFParser().parse(file)) {
            NamingTable naming = ttf.getNaming();
            String family = (naming != null && naming.getFontFamily() != null)
                    ? naming.getFontFamily()
                    : stripExtension(originalName);

            Integer weight = null;
            Boolean italic = null;

            OS2WindowsMetricsTable os2 = ttf.getOS2Windows();
            if (os2 != null) {
                weight = os2.getWeightClass();
                italic = (os2.getFsSelection() & 0x01) != 0; // bit 0 = ITALIC
            }

            String subFamily = (naming != null) ? naming.getFontSubFamily() : null;
            if (subFamily != null && subFamily.toLowerCase().contains("italic")) {
                italic = true;
            }

            // Fallback for fonts without usable metadata.
            String lowerName = originalName.toLowerCase();
            if (weight == null) {
                weight = (lowerName.contains("bold") || lowerName.contains("bd")) ? 700 : 400;
            }
            if (italic == null) {
                italic = lowerName.contains("italic") || lowerName.matches(".*[^a-z]i\\..*");
            }

            BaseRendererBuilder.FontStyle style = italic
                    ? BaseRendererBuilder.FontStyle.ITALIC
                    : BaseRendererBuilder.FontStyle.NORMAL;

            fonts.add(new FontInfo(file, family, weight, style));
        }
    }

    private boolean hasSupportedExtension(String name) {
        String lower = name.toLowerCase();
        for (String ext : SUPPORTED_EXTENSIONS) {
            if (lower.endsWith(ext)) return true;
        }
        return false;
    }

    private void loadFromJar(URL url) throws IOException {
        JarURLConnection connection = (JarURLConnection) url.openConnection();
        JarFile jarFile = connection.getJarFile();

        Enumeration<JarEntry> entries = jarFile.entries();
        while (entries.hasMoreElements()) {
            JarEntry entry = entries.nextElement();
            String name = entry.getName();
            if (name.startsWith(fontsPath) && hasSupportedExtension(name)) {
                try (InputStream is = jarFile.getInputStream(entry)) {
                    File tempFile = TempFilesManager.getInstance().createNewTempFile();
                    try (OutputStream os = new FileOutputStream(tempFile)) {
                        is.transferTo(os);
                    }
                    registerFontFile(tempFile, name);
                }
            }
        }
    }

    private void loadFromDirectory(URL url) throws IOException, URISyntaxException {
        Path dir = Paths.get(url.toURI());
        try (Stream<Path> stream = Files.walk(dir)) {
            stream
                .filter(p -> hasSupportedExtension(p.toString()))
                .forEach(p -> {
                    try {
                        File tempFile = TempFilesManager.getInstance().createNewTempFile();
                        Files.copy(p, tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        registerFontFile(tempFile, p.getFileName().toString());
                    } catch (IOException e) {
                        String message = "Unable to read fonts";
                        StartupExceptionHolder.addException(message);
                        throw new StartupException(message);
                    }
                });
        }
    }

    private FontsManager() throws IOException {
        fonts = new ArrayList<>();
        try {
            Enumeration<URL> resources = getClass().getClassLoader().getResources(fontsPath);
            while (resources.hasMoreElements()) {
                URL url = resources.nextElement();
                if ("jar".equals(url.getProtocol())) {
                    loadFromJar(url);
                } else if ("file".equals(url.getProtocol())) {
                    loadFromDirectory(url);
                }
            }
        } catch (IOException | URISyntaxException | RuntimeException e) {
            logger.error("Unable to load fonts");
        }

        if (fonts.isEmpty()) {
            logger.error("No fonts were found. This should not happen");
        }
    }

    public void registerFonts(PdfRendererBuilder builder) {
        for (FontInfo font : fonts) {
            builder.useFont(font.file(), font.family(), font.weight(), font.style(), false);
        }
    }
}
