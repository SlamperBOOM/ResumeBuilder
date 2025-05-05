package com.slamperboom.resume.blocks.common;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BlockType {
    MAIN_BLOCK("main_block"),
    CONTACTS("contacts"),
    EXPERIENCE("experience"),
    EDUCATION("education"),
    ADVANCED_TRAINING("advanced_training"),
    LANGUAGES("languages"),
    SKILLS("skills"),
    ABOUT("about"),
    HOBBIES("hobbies"),
    RECOMMENDATIONS("recommendations"),
    ADDITIONAL("additional"),
    PUBLICATIONS("publications");

    private final String string;

    @Override
    public String toString() {
        return string;
    }
}
