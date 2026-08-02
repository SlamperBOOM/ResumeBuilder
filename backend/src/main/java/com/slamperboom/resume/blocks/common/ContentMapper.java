package com.slamperboom.resume.blocks.common;

import com.slamperboom.resume.blocks.content.*;

public class ContentMapper {
    private ContentMapper(){}

    public static IContent mapContent(ContentType contentType) {
        switch (contentType) {
            case ABOUT -> {
                return new AboutContent();
            }
            case SKILLS -> {
                return new SkillsContent();
            }
            case HOBBIES -> {
                return new HobbiesContent();
            }
            case CONTACTS -> {
                return new ContactsContent();
            }
            case EDUCATION -> {
                return new EducationContent();
            }
            case ADVANCED_TRAINING -> {
                return new AdvancedTrainingContent();
            }
            case LANGUAGES -> {
                return new LanguagesContent();
            }
            case MAIN_BLOCK -> {
                return new MainBlockContent();
            }
            case ADDITIONAL -> {
                return new AdditionalContent();
            }
            case EXPERIENCE -> {
                return new ExperienceContent();
            }
            case PUBLICATIONS -> {
                return new PublicationsContent();
            }
            case RECOMMENDATIONS -> {
                return new RecommendationsContent();
            }
            default -> throw new IllegalArgumentException();
        }

    }
}
