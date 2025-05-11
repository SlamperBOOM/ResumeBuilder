package com.slamperboom.htmlConverter;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.slamperboom.utils.TempFilesManager;

import java.io.*;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

public class FontsManager {
    private static FontsManager fontsManagerInstance;

    public static FontsManager getInstance() {
        if (fontsManagerInstance == null) {
            fontsManagerInstance = new FontsManager();
        }
        return fontsManagerInstance;
    }

    private static final String fontsPath = "templates/fonts/";
    private Map<String, File> fontsMap;

    private static String getFontFamily(String fileName) {
        if (fileName.contains("dejavu")) return "DejaVu";
        if (fileName.contains("roboto")) return "Roboto";
        if (fileName.contains("noto")) return "Noto Serif";
        return "Custom";
    }

    private FontsManager(){
        fontsMap = new HashMap<>();
        try {
            Enumeration<URL> urls = getClass().getClassLoader().getResources("templates/fonts");
            while (urls.hasMoreElements()) {
                URL url = urls.nextElement();
                if (url.getProtocol().equals("jar")) {
                    String jarPath = url.getPath().substring(5, url.getPath().indexOf("!"));
                    try (JarFile jar = new JarFile(URLDecoder.decode(jarPath, StandardCharsets.UTF_8))) {
                        Enumeration<JarEntry> entries = jar.entries();
                        while (entries.hasMoreElements()) {
                            JarEntry entry = entries.nextElement();
                            if (entry.getName().startsWith("templates/fonts") && entry.getName().endsWith(".ttf")) {
                                InputStream is = jar.getInputStream(entry);
                                File tempFontFile = TempFilesManager.getInstance().createNewTempFile();
                                try (OutputStream os = new FileOutputStream(tempFontFile)) {
                                    is.transferTo(os);
                                }
                                String fileName = entry.getName().toLowerCase();
                                fontsMap.put(fileName, tempFontFile);
                            }
                        }
                    }
                }
            }
        }catch (IOException e){
            throw new RuntimeException(e);
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
