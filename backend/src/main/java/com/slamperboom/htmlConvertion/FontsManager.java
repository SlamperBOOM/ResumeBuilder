package com.slamperboom.htmlConvertion;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import com.slamperboom.managers.TempFilesManager;
import com.slamperboom.utils.ResourceFiles;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.fontbox.ttf.NamingTable;
import org.apache.fontbox.ttf.OS2WindowsMetricsTable;
import org.apache.fontbox.ttf.TTFParser;
import org.apache.fontbox.ttf.TrueTypeFont;
import org.jboss.logging.Logger;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class FontsManager {
    private static final String FONTS_PATH = "templates/fonts";
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

    FontsManager(TempFilesManager tempFilesManager) {
        fonts = new ArrayList<>();
        try {
            for (ResourceFiles.ResourceFile font : ResourceFiles.read(FONTS_PATH, SUPPORTED_EXTENSIONS)) {
                // openhtmltopdf needs fonts as files, a jar entry isn't one
                File tempFile = tempFilesManager.createNewTempFile();
                Files.write(tempFile.toPath(), font.content());
                registerFontFile(tempFile, font.name());
            }
        } catch (IOException | RuntimeException e) {
            logger.error("Unable to load fonts");
            String message = "Error while reading fonts";
            StartupExceptionHolder.addException(message);
            throw new StartupException(message, e);
        }

        if (fonts.isEmpty()) {
            logger.error("No fonts were found. This should not happen");
        } else {
            logger.info("Fonts were loaded");
        }
    }

    public void registerFonts(PdfRendererBuilder builder) {
        for (FontInfo font : fonts) {
            builder.useFont(font.file(), font.family(), font.weight(), font.style(), false);
        }
    }
}
