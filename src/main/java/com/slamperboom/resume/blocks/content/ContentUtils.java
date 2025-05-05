package com.slamperboom.resume.blocks.content;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ContentUtils {
    public static String formatDate(Date date) {
        if (date == null) return null;
        return new SimpleDateFormat("dd-MM-yyyy").format(date);
    }

    public static Date parseDate(String date) {
        if (date == null) return null;
        try {
            return new SimpleDateFormat("dd-MM-yyyy").parse(date);
        } catch (ParseException e) {
            return null;
        }
    }
}
