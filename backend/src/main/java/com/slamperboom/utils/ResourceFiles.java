package com.slamperboom.utils;

import java.io.IOException;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Stream;

public class ResourceFiles {
    private ResourceFiles() {}

    /**
     * @param name    path relative to the requested directory, with "/" separators
     * @param content file bytes
     */
    public record ResourceFile(String name, byte[] content) {}

    private static void readFromJar(URL root, String prefix, String[] extensions, List<ResourceFile> files) throws IOException {
        JarFile jarFile = ((JarURLConnection) root.openConnection()).getJarFile();
        Enumeration<JarEntry> entries = jarFile.entries();
        while (entries.hasMoreElements()) {
            JarEntry entry = entries.nextElement();
            String name = entry.getName();
            if (!entry.isDirectory() && name.startsWith(prefix) && hasExtension(name, extensions)) {
                try (InputStream stream = jarFile.getInputStream(entry)) {
                    files.add(new ResourceFile(name.substring(prefix.length()), stream.readAllBytes()));
                }
            }
        }
    }

    private static void readFromDirectory(URL root, String[] extensions, List<ResourceFile> files) throws IOException {
        Path dir;
        try {
            dir = Path.of(root.toURI());
        } catch (URISyntaxException e) {
            throw new IOException("Invalid resource location: " + root, e);
        }
        try (Stream<Path> paths = Files.walk(dir)) {
            List<Path> matching = paths
                    .filter(Files::isRegularFile)
                    .filter(path -> hasExtension(path.toString(), extensions))
                    .toList();
            for (Path path : matching) {
                files.add(new ResourceFile(dir.relativize(path).toString().replace('\\', '/'), Files.readAllBytes(path)));
            }
        }
    }

    private static boolean hasExtension(String name, String[] extensions) {
        String lower = name.toLowerCase();
        return Arrays.stream(extensions).anyMatch(extension -> lower.endsWith(extension.toLowerCase()));
    }

    /**
     * Reads every file with one of the extensions from a classpath directory and its subdirectories.
     * Works for resources packed into a jar (packaged app) and for plain directories (tests, dev mode).
     *
     * @param dir        classpath directory, e.g. "templates/fonts"
     * @param extensions file extensions with a dot, e.g. ".ttf", case-insensitive
     */
    public static List<ResourceFile> read(String dir, String... extensions) throws IOException {
        String prefix = dir.endsWith("/") ? dir : dir + "/";
        List<ResourceFile> files = new ArrayList<>();
        Enumeration<URL> roots = ResourceFiles.class.getClassLoader().getResources(prefix);
        while (roots.hasMoreElements()) {
            URL root = roots.nextElement();
            switch (root.getProtocol()) {
                case "jar" -> readFromJar(root, prefix, extensions, files);
                case "file" -> readFromDirectory(root, extensions, files);
                default -> throw new IOException("Unsupported resource location: " + root);
            }
        }
        return files;
    }
}
