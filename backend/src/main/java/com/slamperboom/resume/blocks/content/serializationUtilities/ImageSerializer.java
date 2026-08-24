package com.slamperboom.resume.blocks.content.serializationUtilities;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.slamperboom.utils.ImageToBase64;

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

    @Override
    public void serialize(String s, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        if (serializerProvider.getConfig().isEnabled(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)) {
            jsonGenerator.writeString(s);
        } else {
            try {
                jsonGenerator.writeString(ImageToBase64.imageToDataUri(s));
            } catch (IOException e) {
                jsonGenerator.writeString(s);
            }
        }
    }
}
