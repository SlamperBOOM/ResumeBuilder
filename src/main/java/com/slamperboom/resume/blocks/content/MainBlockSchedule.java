package com.slamperboom.resume.blocks.content;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum MainBlockSchedule {
    FULL_TIME("full_time"),
    FLEXIBLE("flexible"),
    SHIFT("shift"),
    REMOTE("remote"),
    SHIFT_WATCH("shift_watch");

    private final String string;

    @Override
    public String toString() {
        return string;
    }
}
