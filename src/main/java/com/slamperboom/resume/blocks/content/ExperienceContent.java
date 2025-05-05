package com.slamperboom.resume.blocks.content;

import com.slamperboom.resume.blocks.common.IContent;
import org.json.JSONObject;

import java.util.Date;
import java.util.List;

public class ExperienceContent implements IContent {
    private static final String WORK_EXPERIENCES_KEY = "work_experiences";

    private List<WorkExperience> workExperiences;

    @Override
    public JSONObject getJson() {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put(WORK_EXPERIENCES_KEY, workExperiences.stream().map(WorkExperience::getJson).toList());
        return jsonObject;
    }

    @Override
    public void updateContent(JSONObject content) {
        if (content.has(WORK_EXPERIENCES_KEY)) {
            this.workExperiences = content.getJSONArray(WORK_EXPERIENCES_KEY).toList()
                    .stream().map(o -> WorkExperience.parseJson((JSONObject) o))
                    .toList();
        } else {
            this.workExperiences = null;
        }
    }

    private static class WorkExperience {
        private static final String POSITION_KEY = "position";
        private static final String COMPANY_KEY = "company";
        private static final String START_DATE = "start_date";
        private static final String END_DATE = "end_date";
        private static final String IS_STILL_WORKING_KEY = "is_still_working";
        private static final String WORK_DESCRIPTION_KEY = "work_description";

        private String position;
        private String company;
        private Date startDate;
        private Date endDate;
        private boolean isStillWorking;
        private String workDescription;

        private JSONObject getJson() {
            JSONObject jsonObject = new JSONObject();
            jsonObject
                    .put(POSITION_KEY, position)
                    .put(COMPANY_KEY, company)
                    .put(START_DATE, ContentUtils.formatDate(startDate))
                    .put(END_DATE, ContentUtils.formatDate(endDate))
                    .put(IS_STILL_WORKING_KEY, isStillWorking)
                    .put(WORK_DESCRIPTION_KEY, workDescription);
            return jsonObject;
        }

        private static WorkExperience parseJson(JSONObject jsonObject) {
            WorkExperience experience = new WorkExperience();
            experience.position = jsonObject.optString(POSITION_KEY, null);
            experience.company = jsonObject.optString(COMPANY_KEY, null);
            experience.startDate = ContentUtils.parseDate(jsonObject.optString(START_DATE));
            experience.endDate = ContentUtils.parseDate(jsonObject.optString(END_DATE));
            experience.isStillWorking = jsonObject.optBoolean(IS_STILL_WORKING_KEY);
            experience.workDescription = jsonObject.optString(WORK_DESCRIPTION_KEY, null);
            return experience;
        }
    }
}
