package com.slamperboom.utils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

public class ImageToBase64 {
    private ImageToBase64() {}

    public static String imageToDataUri(String path) throws IOException {
        Path imagePath = Path.of(path);

        byte[] bytes = Files.readAllBytes(imagePath);

        String mimeType = Files.probeContentType(imagePath);
        if (mimeType != null) {
            return "data:" + mimeType + ";base64,"
                    + Base64.getEncoder().encodeToString(bytes);
        }

        String[] pathSplit = path.split("\\.");
        String extension = pathSplit[pathSplit.length-1];

        mimeType = switch (extension.toLowerCase()) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "bmp" -> "image/bmp";
            default -> "application/octet-stream";
        };
        return "data:" + mimeType + ";base64,"
                + Base64.getEncoder().encodeToString(bytes);
    }
}
