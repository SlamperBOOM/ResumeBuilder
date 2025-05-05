package com.slamperboom.resume.saves;

import com.slamperboom.resume.blocks.common.BlockType;
import com.slamperboom.resume.blocks.common.IBlock;
import org.json.JSONObject;

import java.util.List;

public interface IResume {
    String getVersionOfLastEdit();
    String getId();
    String getName();
    List<IBlock> getBlocks();
    JSONObject getJson();
    boolean isSaved();
    void updateContent(BlockType blockType, JSONObject content);
}
