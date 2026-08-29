package com.slamperboom.managers;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SchemaType {
    MAIN_SCREEN("/screens/main_schema.json"),
    EDIT_SCREEN("/screens/edit_schema.json"),
    HEADER("/screens/header_schema.json"),
    LANGUAGE_DIALOG("/screens/language_dialog_schema.json"),
    TEMPLATES("/screens/templates_schema.json");

    private final String schemaFilePath;
}
