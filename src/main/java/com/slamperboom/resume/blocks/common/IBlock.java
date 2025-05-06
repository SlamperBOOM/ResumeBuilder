package com.slamperboom.resume.blocks.common;

import com.fasterxml.jackson.databind.JsonNode;

public interface IBlock {
    BlockType getBlockType();
    IContent getContent();
    void updateContent(JsonNode content);
}
