package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.IContent;

public class AdditionalContent implements IContent {
    @JsonProperty("additional_info")
    private String additionalInfo;

    @JsonProperty("show_on_side")
    private boolean showOnSide;
}
