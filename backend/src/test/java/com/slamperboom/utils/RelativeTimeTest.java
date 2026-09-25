package com.slamperboom.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDateTime;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Russian needs three plural forms and picks them by the last digits, so the boundaries
 * (11-14 behave like 5, 21 behaves like 1) are where this gets it wrong if it gets it wrong.
 */
class RelativeTimeTest {
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 9, 26, 12, 0);

    private static JsonNode translations() {
        ObjectNode node = new ObjectMapper().createObjectNode();
        node.put("modified.just_now", "Только что");
        node.put("modified.minutes_one", "{0} минуту назад");
        node.put("modified.minutes_few", "{0} минуты назад");
        node.put("modified.minutes_many", "{0} минут назад");
        node.put("modified.hours_one", "{0} час назад");
        node.put("modified.hours_few", "{0} часа назад");
        node.put("modified.hours_many", "{0} часов назад");
        node.put("modified.yesterday", "Вчера");
        node.put("modified.days_one", "{0} день назад");
        node.put("modified.days_few", "{0} дня назад");
        node.put("modified.days_many", "{0} дней назад");
        return node;
    }

    private static String ru(LocalDateTime moment) {
        return RelativeTime.format(moment, NOW, new Locale("ru"), translations());
    }

    @ParameterizedTest(name = "{0} minutes -> {1}")
    @CsvSource({
            "1, 1 минуту назад",
            "2, 2 минуты назад",
            "5, 5 минут назад",
            "11, 11 минут назад",
            "14, 14 минут назад",
            "21, 21 минуту назад",
            "22, 22 минуты назад",
            "25, 25 минут назад",
    })
    void russianPluralsFollowTheLastDigits(long minutes, String expected) {
        assertEquals(expected, ru(NOW.minusMinutes(minutes)));
    }

    @Test
    void underAMinuteIsJustNow() {
        assertEquals("Только что", ru(NOW.minusSeconds(59)));
    }

    @Test
    void aDateInTheFutureNeverReadsAsTheFuture() {
        assertEquals("Только что", ru(NOW.plusMinutes(5)));
    }

    @Test
    void hoursAreCountedUntilTheDayFlips() {
        assertEquals("23 часа назад", ru(NOW.minusHours(23)));
    }

    @Test
    void theDayBeforeIsYesterday() {
        assertEquals("Вчера", ru(NOW.minusDays(1)));
    }

    @Test
    void daysAreCountedByTheCalendar() {
        assertEquals("3 дня назад", ru(NOW.minusDays(3)));
    }

    @Test
    void pastAWeekTheDateIsWrittenOut() {
        String formatted = ru(NOW.minusDays(40));
        assertEquals(false, formatted.contains("назад"));
    }

    @Test
    void englishHasTwoForms() {
        JsonNode english = new ObjectMapper().createObjectNode()
                .put("modified.minutes_one", "{0} minute ago")
                .put("modified.minutes_many", "{0} minutes ago");
        assertEquals("1 minute ago",
                RelativeTime.format(NOW.minusMinutes(1), NOW, Locale.ENGLISH, english));
        assertEquals("21 minutes ago",
                RelativeTime.format(NOW.minusMinutes(21), NOW, Locale.ENGLISH, english));
    }
}
