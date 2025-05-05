package com.slamperboom.resume.blocks.content;

import com.slamperboom.resume.blocks.common.IContent;
import lombok.Getter;
import org.json.JSONObject;

import java.util.Date;

@Getter
public class MainBlockContent implements IContent {
    private static final String DESIRED_POSITION_KEY = "desired_position";
    private static final String PHOTO_NAME_KEY = "photo_name";
    private static final String LAST_NAME_KEY = "last_name";
    private static final String FIRST_NAME_KEY = "first_name";
    private static final String DATE_OF_BIRTH_KEY = "date_of_birth";
    private static final String CITY_KEY = "city";
    private static final String DESIRED_SALARY_KEY = "desired_salary";
    private static final String OCCUPATION_KEY = "occupation";
    private static final String EMPLOYMENT_KEY = "employment";
    private static final String SCHEDULE_KEY = "schedule";
    private static final String IS_MOVING_ACCEPTABLE_KEY = "is_moving_acceptable";
    private static final String IS_READY_FOR_BUSINESS_TRIPS_KEY = "is_ready_for_business_trips";
    private static final String DRIVER_LICENSE_KEY = "driver_license";
    private static final String MARITAL_STATUS_KEY = "marital_status";
    private static final String HAVE_CHILDREN_KEY = "have_children";
    private static final String GOAL_OF_RESUME_KEY = "goal_of_resume";

    private String desiredPosition;
    private String photoName;
    private String lastName;
    private String firstName;
    private Date dateOfBirth;
    private String city;
    private String desiredSalary;
    private String occupation;
    private MainBlockEmployment employment;
    private MainBlockSchedule schedule;
    private boolean isMovingAcceptable;
    private boolean isReadyForBusinessTrips;
    private String driverLicense;
    private String maritalStatus;
    private boolean haveChildren;
    private String goalOfTheResume;

    @Override
    public JSONObject getJson() {
        JSONObject jsonObject = new JSONObject();
        jsonObject
                .put(DESIRED_POSITION_KEY, desiredPosition)
                .put(PHOTO_NAME_KEY, photoName)
                .put(LAST_NAME_KEY, lastName)
                .put(FIRST_NAME_KEY, firstName)
                .put(DATE_OF_BIRTH_KEY, ContentUtils.formatDate(dateOfBirth))
                .put(CITY_KEY, city)
                .put(DESIRED_SALARY_KEY, desiredSalary)
                .put(OCCUPATION_KEY, occupation)
                .put(IS_MOVING_ACCEPTABLE_KEY, isMovingAcceptable)
                .put(IS_READY_FOR_BUSINESS_TRIPS_KEY, isReadyForBusinessTrips)
                .put(DRIVER_LICENSE_KEY, driverLicense)
                .put(MARITAL_STATUS_KEY, maritalStatus)
                .put(HAVE_CHILDREN_KEY, haveChildren)
                .put(GOAL_OF_RESUME_KEY, goalOfTheResume);
        if (this.employment != null) {
            jsonObject.put(EMPLOYMENT_KEY, employment.toString());
        }
        if (this.schedule != null) {
            jsonObject.put(SCHEDULE_KEY, schedule.toString());
        }
        return jsonObject;
    }

    @Override
    public void updateContent(JSONObject content) {
        this.desiredPosition = content.optString(DESIRED_POSITION_KEY, null);
        this.photoName = content.optString(PHOTO_NAME_KEY, null);
        this.lastName = content.optString(LAST_NAME_KEY, null);
        this.firstName = content.optString(FIRST_NAME_KEY, null);
        this.dateOfBirth = ContentUtils.parseDate(content.optString(DATE_OF_BIRTH_KEY));
        this.city = content.optString(CITY_KEY, null);
        this.desiredSalary = content.optString(DESIRED_SALARY_KEY, null);
        this.occupation = content.optString(OCCUPATION_KEY, null);
        if (content.has(EMPLOYMENT_KEY)) {
            this.employment = MainBlockEmployment.fromString(content.getString(EMPLOYMENT_KEY));
        } else {
            this.employment = null;
        }
        if (content.has(SCHEDULE_KEY)) {
            this.schedule = MainBlockSchedule.valueOf(content.optString(SCHEDULE_KEY));
        } else {
            this.schedule = null;
        }
        this.isMovingAcceptable = content.optBoolean(IS_MOVING_ACCEPTABLE_KEY);
        this.isReadyForBusinessTrips = content.optBoolean(IS_READY_FOR_BUSINESS_TRIPS_KEY);
        this.driverLicense = content.optString(DRIVER_LICENSE_KEY, null);
        this.maritalStatus = content.optString(MARITAL_STATUS_KEY, null);
        this.haveChildren = content.optBoolean(HAVE_CHILDREN_KEY);
        this.goalOfTheResume = content.optString(GOAL_OF_RESUME_KEY, null);
    }
}
