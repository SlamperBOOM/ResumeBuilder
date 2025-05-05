package com.slamperboom.resume.blocks.content;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum MainBlockEmployment {
    FULL_TIME("full_time"),
    PART_TIME("part_time"),
    PROJECT("project"),
    VOLUNTEER("volunteer"),
    INTERNSHIP("internship");

    private final String string;

    @Override
    public String toString() {
        return string;
    }

    public static MainBlockEmployment fromString(String string) {
        if (string.isEmpty()) return null;
        switch (string) {
            case "full_time" -> {
                return FULL_TIME;
            }
            case "part_time" -> {
                return PART_TIME;
            }
            case "project" -> {
                return PROJECT;
            }
            case "volunteer" -> {
                return VOLUNTEER;
            }
            case "internship" -> {
                return INTERNSHIP;
            }
            default -> throw new IllegalStateException("Unexpected value: " + string);
        }
    }
}
