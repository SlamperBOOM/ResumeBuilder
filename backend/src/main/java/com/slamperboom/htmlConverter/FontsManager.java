package com.slamperboom.htmlConverter;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.utils.TempFilesManager;

import java.io.*;
import java.net.JarURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Stream;

public class FontsManager {
    private static FontsManager fontsManagerInstance;

    public static FontsManager getInstance() {
        if (fontsManagerInstance == null) {
            try {
                fontsManagerInstance = new FontsManager();
            } catch (IOException e){
                String message = "Error while reading fonts";
                StartupExceptionHolder.addException(message);
                throw new StartupException(message, e);
            }
        }
        return fontsManagerInstance;
    }

    private static final String fontsPath = "templates/fonts/";
    private final Map<String, File> fontsMap;

    private static String getFontFamily(String fileName) {
        if (fileName.contains("dejavu")) return "DejaVu";
        if (fileName.contains("roboto")) return "Roboto";
        if (fileName.contains("noto")) return "Noto Serif";
        return "Custom";
    }

    private FontsManager() throws IOException {
        fontsMap = new HashMap<>();
        try {
            Enumeration<URL> resources = getClass().getClassLoader().getResources(fontsPath);
            while (resources.hasMoreElements()) {
                URL url = resources.nextElement();
                if ("jar".equals(url.getProtocol())) {
                    JarURLConnection connection = (JarURLConnection) url.openConnection();
                    JarFile jarFile = connection.getJarFile();

                    Enumeration<JarEntry> entries = jarFile.entries();
                    while (entries.hasMoreElements()) {
                        JarEntry entry = entries.nextElement();

                        String name = entry.getName();
                        if (name.startsWith(fontsPath) && name.endsWith(".ttf")) {
                            try (InputStream is = jarFile.getInputStream(entry)) {
                                File tempFile = TempFilesManager.getInstance().createNewTempFile();
                                try (OutputStream os = new FileOutputStream(tempFile)) {
                                    is.transferTo(os);
                                }
                                fontsMap.put(name.toLowerCase(), tempFile);
                            }
                        }
                    }
                }

                else if ("file".equals(url.getProtocol())) {
                    Path dir = Paths.get(url.toURI());
                    try (Stream<Path> stream = Files.walk(dir)) {
                        stream
                            .filter(p -> p.toString().endsWith(".ttf"))
                            .forEach(p -> {
                                try {
                                    File tempFile = TempFilesManager.getInstance().createNewTempFile();
                                    Files.copy(p, tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                                    fontsMap.put(p.getFileName().toString().toLowerCase(), tempFile);
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            });
                    }
                }
            }
        } catch (IOException | URISyntaxException | RuntimeException e){
            throw new IOException(e);
        }
    }

    public void registerFonts(PdfRendererBuilder builder) {
        for (var font: fontsMap.entrySet()) {
            String fileName = font.getKey();
            String family = getFontFamily(fileName);
            int weight = fileName.contains("bd") || fileName.contains("bold") ? 700 : 400;
            BaseRendererBuilder.FontStyle style = BaseRendererBuilder.FontStyle.NORMAL;

            if (fileName.contains("italic")) {
                style = BaseRendererBuilder.FontStyle.ITALIC;
            }
            builder.useFont(font.getValue(), family, weight, style, false);
        }
    }
}
