package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.enums.MainBlockEmployment;
import com.slamperboom.resume.blocks.content.enums.MainBlockSchedule;
import com.slamperboom.resume.blocks.content.serializationUtilities.MainBlockDateSerializer;

import java.time.LocalDate;

public class MainBlockContent implements IContent {
    @JsonProperty("desired_position")
    private String desiredPosition;

    @JsonProperty("photo_name")
    private String photoName;

    @JsonProperty("last_name")
    private String lastName;

    @JsonProperty("first_name")
    private String firstName;

    @JsonSerialize(using = MainBlockDateSerializer.class)
    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

    @JsonProperty("city")
    private String city;

    @JsonProperty("desired_salary")
    private String desiredSalary;

    @JsonProperty("occupation")
    private String occupation;

    @JsonProperty("employment")
    private MainBlockEmployment employment;

    @JsonProperty("schedule")
    private MainBlockSchedule schedule;

    @JsonProperty("is_moving_acceptable")
    private boolean isMovingAcceptable;

    @JsonProperty("is_ready_for_business_trips")
    private boolean isReadyForBusinessTrips;

    @JsonProperty("driver_license")
    private String driverLicense;

    @JsonProperty("marital_status")
    private String maritalStatus;

    @JsonProperty("have_children")
    private boolean haveChildren;

    @JsonProperty("goal_of_resume")
    private String goalOfTheResume;

    @Override
    public ContentType getContentType() {
        return ContentType.MAIN_BLOCK;
    }
}
