package com.slamperboom.htmlConverter;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Template {
    SIMPLE_TEMPLATE("simple_template"),
    SIMPLE_DIVIDED_TEMPLATE("simple_divided_template"),
    TIMELINE_TEMPLATE("timeline_template"),
    SIMPLE_TEMPLATE_UPDATED("simple_template_updated"),
    ;

    private final String templateName;

    @Override
    public String toString() {
        return templateName;
    }
}
