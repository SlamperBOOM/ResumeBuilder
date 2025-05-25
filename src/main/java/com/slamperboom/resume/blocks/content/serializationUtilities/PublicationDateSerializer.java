package com.slamperboom.resume.blocks.content.serializationUtilities;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.slamperboom.translations.TranslationsManager;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class PublicationDateSerializer extends StdSerializer<LocalDate> {
    public PublicationDateSerializer() {
        this(null);
    }

    public PublicationDateSerializer(Class<LocalDate> t) {
        super(t);
    }

    @Override
    public void serialize(LocalDate date, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        Locale currentLocale = TranslationsManager.getInstance().getCurrentLocale();
        if (serializerProvider.getConfig().isEnabled(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)) {
            jsonGenerator.writeString(date.toString());
        } else {
            DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("LLLL yyyy", currentLocale);
            jsonGenerator.writeString(dateFormat.format(date));
        }
    }
}
