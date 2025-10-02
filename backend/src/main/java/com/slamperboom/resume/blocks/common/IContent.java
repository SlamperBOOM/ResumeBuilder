package com.slamperboom.resume.blocks.common;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.slamperboom.resume.blocks.content.*;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "@type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = AboutContent.class, name = "AboutContent"),
        @JsonSubTypes.Type(value = AdditionalContent.class, name = "AdditionalContent"),
        @JsonSubTypes.Type(value = AdvancedTrainingContent.class, name = "AdvancedTrainingContent"),
        @JsonSubTypes.Type(value = ContactsContent.class, name = "ContactsContent"),
        @JsonSubTypes.Type(value = EducationContent.class, name = "EducationContent"),
        @JsonSubTypes.Type(value = ExperienceContent.class, name = "ExperienceContent"),
        @JsonSubTypes.Type(value = HobbiesContent.class, name = "HobbiesContent"),
        @JsonSubTypes.Type(value = LanguagesContent.class, name = "LanguagesContent"),
        @JsonSubTypes.Type(value = MainBlockContent.class, name = "MainBlockContent"),
        @JsonSubTypes.Type(value = PublicationsContent.class, name = "PublicationsContent"),
        @JsonSubTypes.Type(value = RecommendationsContent.class, name = "RecommendationsContent"),
        @JsonSubTypes.Type(value = SkillsContent.class, name = "SkillsContent"),
})
public interface IContent {
    @JsonIgnore
    ContentType getContentType();
}
