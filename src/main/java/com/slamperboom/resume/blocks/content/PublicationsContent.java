package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.IContent;

public class PublicationsContent implements IContent {
    @JsonProperty("publication")
    private String publicationNameOrLink;

    @JsonProperty("year")
    private String year;

    @JsonProperty("month")
    private String month;
}
