package com.slamperboom.resume.blocks.common;

public record Block(BlockType blockType, IContent content) implements IBlock {
}
