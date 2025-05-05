package com.slamperboom.resume.blocks.common;

import com.fasterxml.jackson.databind.JsonNode;

public interface IContent {
    JsonNode createJson();
    void updateContent(JsonNode content);
}
