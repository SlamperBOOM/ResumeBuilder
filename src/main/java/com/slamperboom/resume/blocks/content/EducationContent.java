package com.slamperboom.resume.blocks.content;

import com.slamperboom.resume.blocks.common.IContent;
import org.json.JSONObject;

import java.util.List;

public class EducationContent implements IContent {
    private static final String EDUCATIONS_KEY = "educations";

    private List<Education> educations;

    @Override
    public JSONObject getJson() {
        return null;
    }

    @Override
    public void updateContent(JSONObject content) {

    }

    private static class Education {
        private static final String INSTITUTION_KEY = "institution";
        private static final String EDUCATION_LEVEL_STRING = "education_level";

        private String institution;
        private EducationContentEducationLevel educationLevel;
        private String faculty;
        private String speciality;
        private String yearOfGraduate;
    }
}
