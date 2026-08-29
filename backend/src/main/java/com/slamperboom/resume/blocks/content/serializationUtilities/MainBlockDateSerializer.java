package com.slamperboom.resume.blocks.content.serializationUtilities;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.slamperboom.managers.TranslationsManager;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

public class MainBlockDateSerializer extends StdSerializer<LocalDate> {
    public MainBlockDateSerializer(){
        this(null);
    }

    public MainBlockDateSerializer(Class<LocalDate> t) {
        super(t);
    }

    @Override
    public void serialize(LocalDate date, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        Locale currentLocale = TranslationsManager.getInstance().getCurrentLocale();
        if (serializerProvider.getConfig().isEnabled(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)) {
            jsonGenerator.writeString(date.toString());
        } else {
            DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("dd.MM.yyyy", currentLocale);
            String builder = dateFormat.format(date) + " (" +
                    ChronoUnit.YEARS.between(date, LocalDate.now()) +
                    ")";
            jsonGenerator.writeString(builder);
        }
    }
}
