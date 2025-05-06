package com.slamperboom.resume.blocks.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;

@Getter
public class Block implements IBlock {
    private final BlockType blockType;
    private IContent content;

    public Block(BlockType blockType, IContent content) {
        this.blockType = blockType;
        this.content = content;
    }

    @Override
    public void updateContent(JsonNode content) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            this.content = mapper.treeToValue(content, IContent.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
