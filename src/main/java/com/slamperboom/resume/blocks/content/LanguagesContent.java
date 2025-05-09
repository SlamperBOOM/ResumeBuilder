package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

public class LanguagesContent implements IContent {
    @JsonProperty("language")
    private String language;

    @JsonProperty("language_level")
    private LanguageContentLanguageLevel languageLevel;

    @Override
    public ContentType getContentType() {
        return ContentType.LANGUAGES;
    }
}
