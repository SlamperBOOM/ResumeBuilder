package com.slamperboom.utils;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.FormatStyle;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/**
 * Turns a modification date into the phrase shown under a resume on the main screen:
 * relative inside a week ("5 minutes ago", "yesterday"), a plain date after it.
 * <p>
 * The phrases come from the main screen translations under the "modified." prefix. Units that take
 * a number have three forms, "_one", "_few" and "_many", because Russian needs all three; English
 * fills "few" and "many" with the same text.
 */
public final class RelativeTime {
    private static final String KEY_PREFIX = "modified.";
    private static final String COUNT_PLACEHOLDER = "{0}";
    private static final long RELATIVE_UNTIL_DAYS = 7;

    private RelativeTime() {
    }

    public static String format(LocalDateTime moment, LocalDateTime now, Locale locale, JsonNode translations) {
        Duration elapsed = Duration.between(moment, now);
        if (elapsed.isNegative()) {
            elapsed = Duration.ZERO;
        }

        if (elapsed.toMinutes() < 1) {
            return text(translations, "just_now");
        }
        if (elapsed.toMinutes() < 60) {
            return counted(translations, "minutes", elapsed.toMinutes(), locale);
        }
        if (elapsed.toHours() < 24) {
            return counted(translations, "hours", elapsed.toHours(), locale);
        }

        long days = ChronoUnit.DAYS.between(moment.toLocalDate(), now.toLocalDate());
        if (days <= 1) {
            return text(translations, "yesterday");
        }
        if (days < RELATIVE_UNTIL_DAYS) {
            return counted(translations, "days", days, locale);
        }

        return moment.toLocalDate()
                .format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(locale));
    }

    private static String counted(JsonNode translations, String unit, long value, Locale locale) {
        return text(translations, unit + "_" + pluralForm(value, locale))
                .replace(COUNT_PLACEHOLDER, Long.toString(value));
    }

    static String pluralForm(long value, Locale locale) {
        if (!"ru".equals(locale.getLanguage())) {
            return value == 1 ? "one" : "many";
        }
        long lastDigit = value % 10;
        long lastTwoDigits = value % 100;
        if (lastDigit == 1 && lastTwoDigits != 11) {
            return "one";
        }
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
            return "few";
        }
        return "many";
    }

    private static String text(JsonNode translations, String key) {
        String fullKey = KEY_PREFIX + key;
        JsonNode value = translations == null ? null : translations.get(fullKey);
        return value == null ? fullKey : value.asText();
    }
}
