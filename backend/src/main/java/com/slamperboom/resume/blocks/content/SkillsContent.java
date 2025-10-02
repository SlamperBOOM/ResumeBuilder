package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.enums.SkillsContentSkillLevel;

import java.util.List;

public class SkillsContent implements IContent {
    @JsonProperty("skills")
    private List<Skill> skills;

    @Override
    public ContentType getContentType() {
        return ContentType.SKILLS;
    }

    private static class Skill{
        @JsonProperty("skill_name")
        private String skillName;

        @JsonProperty("skill_level")
        private SkillsContentSkillLevel skillLevel;
    }
}
