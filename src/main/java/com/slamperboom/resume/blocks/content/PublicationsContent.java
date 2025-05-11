package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.Date;
import java.util.List;

public class PublicationsContent implements IContent {
    @JsonProperty("publications")
    private List<Publication> publications;

    @Override
    public ContentType getContentType() {
        return ContentType.PUBLICATIONS;
    }

    private static class Publication{
        @JsonProperty("publication")
        private String publicationNameOrLink;

        @JsonProperty("date")
        private Date date;
    }
}
