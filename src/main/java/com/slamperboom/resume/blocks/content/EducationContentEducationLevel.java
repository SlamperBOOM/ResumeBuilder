package com.slamperboom.resume.blocks.content;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum EducationContentEducationLevel {
    BACHELOR("bachelor"),
    ;

    private final String string;

    @Override
    public String toString() {
        return string;
    }
}
