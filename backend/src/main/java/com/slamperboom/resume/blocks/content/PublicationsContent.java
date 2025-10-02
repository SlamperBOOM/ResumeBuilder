package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.serializationUtilities.PublicationDateSerializer;

import java.time.LocalDate;
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

        @JsonSerialize(using = PublicationDateSerializer.class)
        @JsonProperty("date")
        private LocalDate date;
    }
}
