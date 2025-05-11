package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.List;

public class LanguagesContent implements IContent {
    @JsonProperty("languages")
    private List<Language> languages;

    @Override
    public ContentType getContentType() {
        return ContentType.LANGUAGES;
    }

    private static class Language{
        @JsonProperty("language")
        private String language;

        @JsonProperty("language_level")
        private LanguageContentLanguageLevel languageLevel;
    }
}
