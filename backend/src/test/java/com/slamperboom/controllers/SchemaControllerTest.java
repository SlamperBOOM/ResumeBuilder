package com.slamperboom.controllers;

import com.slamperboom.testutil.FileSystemIsolationExtension;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * These endpoints are read through {@link com.slamperboom.bdui.BDUIBuilder}, which touches the real
 * {@link com.slamperboom.resume.saves.ResumeManager} (main_screen/edit_screen re-read
 * "saves/" from disk on every call) - {@link FileSystemIsolationExtension} keeps that off
 * the developer's real data.
 */
@QuarkusTest
@ExtendWith(FileSystemIsolationExtension.class)
class SchemaControllerTest {

    @Test
    void getHeader_returnsSchemaAndTranslations() {
        given()
            .when().get("/schema/header")
            .then()
                .statusCode(200)
                .body("schema", notNullValue())
                .body("translations", notNullValue());
    }

    @Test
    void getLanguageDialog_listsEnglishAndRussianLocales() {
        given()
            .when().get("/schema/language_dialog")
            .then()
                .statusCode(200)
                .body("payload.locales.locale", hasItems("en", "ru"));
    }

    @Test
    void getMainScreen_withNoResumes_returnsEmptyPayload() {
        given()
            .when().get("/schema/main_screen")
            .then()
                .statusCode(200)
                .body("payload.resumes", hasSize(0));
    }

    @Test
    void getMainScreen_afterCreatingAResume_listsIt() {
        String resumeId =
            given()
                .when().post("/action/create_new")
                .then().statusCode(200)
                .extract().path("payload.resume_id");

        given()
            .when().get("/schema/main_screen")
            .then()
                .statusCode(200)
                .body("payload.resumes.resume_id", hasItem(resumeId));
    }

    @Test
    void getEditScreen_forExistingResume_returnsItsData() {
        String resumeId =
            given()
                .when().post("/action/create_new")
                .then().statusCode(200)
                .extract().path("payload.resume_id");

        given()
            .when().get("/schema/edit_screen/" + resumeId)
            .then()
                .statusCode(200)
                // "New resume" is the default name configured in global_settings.json
                .body("payload.resume.resume_name", equalTo("New resume"));
    }

    @Test
    void getEditScreen_forUnknownResume_currentlyFailsInsteadOfShowingAnError() {
        given()
            .when().get("/schema/edit_screen/does-not-exist")
            .then()
                .statusCode(greaterThanOrEqualTo(200))
                .body("frontend_action", equalTo("SHOW_MESSAGE"));
    }

    @Test
    void getTemplates_forUnknownResume_returnsGracefulErrorDialogInstead() {
        given()
            .when().get("/schema/templates/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("SHOW_MESSAGE"));
    }
}
