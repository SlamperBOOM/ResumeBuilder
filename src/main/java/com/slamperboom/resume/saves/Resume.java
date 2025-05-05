package com.slamperboom.resume.saves;

import com.slamperboom.resume.blocks.common.BlockType;
import com.slamperboom.resume.blocks.common.IBlock;
import lombok.Setter;
import org.json.JSONObject;

import java.util.List;

/**
 * Contains resume and filled blocks of resume
 * This can be transformed into HTML or PDF doc
 */
public class Resume implements IResume {
    private final String id;
    @Setter
    private String versionOfLastEdit;
    @Setter
    private String resumeName;
    @Setter
    private List<IBlock> blocks;
    private boolean isSaved;

    protected Resume(String id) {
        this.id = id;
    }

    @Override
    public String getVersionOfLastEdit() {
        return versionOfLastEdit;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public String getName() {
        return resumeName;
    }

    @Override
    public List<IBlock> getBlocks() {
        return blocks;
    }

    @Override
    public JSONObject getJson() {
        return null;
    }

    public void save(){
        isSaved = true;
    }

    @Override
    public boolean isSaved() {
        return isSaved;
    }

    @Override
    public void updateContent(BlockType blockType, JSONObject content) {
        blocks.stream()
                .filter(block -> block.blockType() == blockType).findFirst()
                .ifPresent(block -> block.content().updateContent(content));
    }
}
