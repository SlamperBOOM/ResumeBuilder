package com.slamperboom.resume.blocks.content.serializationUtilities;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.slamperboom.resume.saves.IResume;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class MonthYearDateSerializer extends StdSerializer<LocalDate> {
    public MonthYearDateSerializer() {
        this(null);
    }

    public MonthYearDateSerializer(Class<LocalDate> t) {
        super(t);
    }

    @Override
    public void serialize(LocalDate date, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        String resumeLocale = (String) serializerProvider.getAttribute(IResume.RESUME_LOCALE_ATTRIBUTE);
        Locale currentLocale = resumeLocale != null
                ? new Locale(resumeLocale)
                : Locale.ENGLISH;
        if (serializerProvider.getConfig().isEnabled(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)) {
            jsonGenerator.writeString(date.toString());
        } else {
            DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("LLLL yyyy", currentLocale);
            jsonGenerator.writeString(dateFormat.format(date));
        }
    }
}
