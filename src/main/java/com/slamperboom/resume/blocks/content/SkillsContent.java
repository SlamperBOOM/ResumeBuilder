package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.resume.blocks.common.IContent;

public class SkillsContent implements IContent {
    @JsonProperty("skill_name")
    private String skillName;

    @JsonProperty("skill_level")
    private SkillsContentSkillLevel skillLevel;
}
