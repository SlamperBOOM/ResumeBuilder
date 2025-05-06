package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.resume.blocks.common.BlockType;
import com.slamperboom.resume.blocks.common.IBlock;

import java.util.List;

public interface IResume {
    String getVersionOfLastEdit();
    String getId();
    String getName();
    List<IBlock> getBlocks();
    JsonNode getJson();
    boolean isSaved();
    void updateContent(BlockType blockType, JsonNode content);
}
