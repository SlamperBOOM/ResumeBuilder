package com.slamperboom.resume.blocks.content.serializationUtilities;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

public class ImageSerializer extends StdSerializer<String> {
    public ImageSerializer(){
        this(null);
    }

    public ImageSerializer(Class<String> t) {
        super(t);
    }

    private String imageToDataUri(String path) throws IOException {
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

    @Override
    public void serialize(String s, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        if (serializerProvider.getConfig().isEnabled(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)) {
            jsonGenerator.writeString(s);
        } else {
            jsonGenerator.writeString(imageToDataUri(s));
        }
    }
}
