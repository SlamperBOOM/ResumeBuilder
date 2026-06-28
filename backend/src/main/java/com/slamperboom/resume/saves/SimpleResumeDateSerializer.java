package com.slamperboom.resume.saves;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.time.LocalDateTime;

public class SimpleResumeDateSerializer extends StdSerializer<LocalDateTime> {
    public SimpleResumeDateSerializer() {this(null);}

    public SimpleResumeDateSerializer(Class<LocalDateTime> t) {super(t);}

    @Override
    public void serialize(LocalDateTime localDateTime, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        jsonGenerator.writeString(localDateTime.toString());
    }
}
