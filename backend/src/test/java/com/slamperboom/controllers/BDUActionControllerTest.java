package com.slamperboom.controllers;

import com.slamperboom.testutil.FileSystemIsolationExtension;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.File;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@ExtendWith(FileSystemIsolationExtension.class)
class BDUActionControllerTest {

    @Test
    void createNew_returnsOpenEditScreenWithAResumeId() {
        given()
            .when().post("/action/create_new")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_EDIT_SCREEN"))
                .body("payload.resume_id", not(emptyOrNullString()));
    }

    @Test
    void createNew_persistsTheResumeFileImmediately() {
        String resumeId =
            given()
                .when().post("/action/create_new")
                .then().statusCode(200)
                .extract().path("payload.resume_id");

        assertResumeFileExists(resumeId);
    }

    @Test
    void load_forAnyId_returnsOpenEditScreen_andTheScreenItselfRejectsUnknownIds() {
        // performLoad() does not validate the id: the check lives one step later, in
        // buildEditScreen(), which is where the frontend learns the resume is gone.
        given()
            .when().get("/action/load/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_EDIT_SCREEN"))
                .body("payload.resume_id", equalTo("does-not-exist"));

        given()
            .when().get("/schema/edit_screen/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("SHOW_MESSAGE"));
    }

    @Test
    void update_changesResumeInfoAndContentBlock_thenPersists() {
        String resumeId = createResume();

        given()
            .contentType(ContentType.JSON)
            .body("{"
                    + "\"resume_id\":\"" + resumeId + "\","
                    + "\"resume_info\":{\"resume_name\":\"Updated CV\",\"template_name\":\"simple_template\",\"resume_locale\":\"en\"},"
                    + "\"content\":[{\"block\":\"ABOUT\",\"payload\":{\"@type\":\"AboutContent\",\"about_text\":\"Hi there\"}}]"
                    + "}")
            .when().post("/action/update")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("UPDATE_CURRENT_SCREEN"));

        given()
            .when().get("/schema/edit_screen/" + resumeId)
            .then()
                .statusCode(200)
                .body("payload.resume.resume_name", equalTo("Updated CV"));
    }

    @Test
    void update_forUnknownResume_ShowMessageDialog() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"resume_id\":\"does-not-exist\",\"resume_info\":{\"resume_name\":\"x\",\"template_name\":\"t\",\"resume_locale\":\"en\"},\"content\":[]}")
            .when().post("/action/update")
            .then()
                .statusCode(greaterThanOrEqualTo(200))
                .body("frontend_action", equalTo("SHOW_MESSAGE"));
    }

    @Test
    void openMainScreen_savesTheResumeAndReturnsOpenMainScreen() {
        String resumeId = createResume();

        given()
            .when().post("/action/open_main_screen/" + resumeId)
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_MAIN_SCREEN"));
    }

    @Test
    void duplicate_copiesTheResumeUnderANewId() {
        String resumeId = createResume();

        given()
            .contentType(ContentType.TEXT)
            .when().post("/action/duplicate/" + resumeId)
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_MAIN_SCREEN"));

        given()
            .when().get("/schema/main_screen")
            .then()
                .statusCode(200)
                .body("payload", hasSize(2));
    }

    @Test
    void duplicate_forUnknownResume_returnsAGracefulMessageDialog() {
        given()
            .contentType(ContentType.TEXT)
            .when().post("/action/duplicate/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("SHOW_MESSAGE"));
    }

    @Test
    void delete_asksForConfirmationAndIncludesTheResumeName() {
        String resumeId = createResume();

        given()
            .when().delete("/action/delete/" + resumeId)
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("SHOW_CONFIRMATION"))
                .body("payload.title", containsString("New resume"))
                .body("payload.confirm_action_payload.resume_id", equalTo(resumeId));
    }

    @Test
    void delete_forUnknownResume_returnsAGracefulMessageDialog() {
        given()
            .when().delete("/action/delete/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("SHOW_MESSAGE"));
    }

    @Test
    void deleteConfirm_removesTheResumeAndItsFile() {
        String resumeId = createResume();

        given()
            .when().delete("/action/delete/confirm/" + resumeId)
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_MAIN_SCREEN"));

        assertResumeFileDoesNotExist(resumeId);
    }

    @Test
    void deleteConfirm_forUnknownResume_isANoOp() {
        // Deleting an id that is already gone is idempotent - nothing to delete, so the user
        // simply lands back on the main screen.
        given()
            .when().delete("/action/delete/confirm/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_MAIN_SCREEN"));
    }

    @Test
    void importResume_withAMissingFile_returnsAMessageDialogWithErrorText() {
        // The text comes from error_messages in the current locale, which other tests may switch
        given()
            .contentType(ContentType.JSON)
            .body("{\"file_name\":\"does-not-exist.json\"}")
            .when().post("/action/import")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("SHOW_MESSAGE"))
                .body("payload.text", not(emptyOrNullString()));
    }

    @Test
    void changeLocale_switchesLocale_thenLocaleAffectsSubsequentTranslations() {
        given()
            .when().post("/action/locale/set/ru")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("UPDATE_CURRENT_SCREEN"));

        given()
            .when().get("/schema/language_dialog")
            .then()
                .statusCode(200)
                .body("translations", notNullValue());

        // restore default locale so later tests in the (shared, static) DynamicSettings
        // singleton aren't affected by this one
        given().when().post("/action/locale/set/en").then().statusCode(200);
    }

    @Test
    void getLocales_returnsLocaleDialogAction() {
        given()
            .when().get("/action/locales")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("LOCALE_DIALOG"));
    }

    @Test
    void about_returnsOpenAboutAction() {
        given()
            .when().get("/action/about")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_ABOUT"))
                .body("payload.app_name", not(emptyOrNullString()))
                .body("payload.github_url", startsWith("https://github.com/"));
    }

    @Test
    void help_returnsTheRenderedHelpPage() {
        given()
            .when().get("/action/help")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_HELP"))
                .body("payload.title", not(emptyOrNullString()))
                .body("payload.html", containsString("<h2>"));
    }

    @Test
    void onboardingStatus_returnsNothingOnceOnboardingIsSeen() {
        given()
            .when().post("/action/onboarding_seen")
            .then()
                .statusCode(200)
                .body(anyOf(emptyString(), equalTo("null")));

        given()
            .when().get("/action/onboarding_status")
            .then()
                .statusCode(200)
                .body(anyOf(emptyString(), equalTo("null")));
    }

    @Test
    void exit_savesEverythingAndReturnsClose() {
        createResume();

        given()
            .when().post("/action/exit")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("CLOSE"));
    }

    private String createResume() {
        return given()
                .when().post("/action/create_new")
                .then().statusCode(200)
                .extract().path("payload.resume_id");
    }

    private void assertResumeFileExists(String resumeId) {
        org.junit.jupiter.api.Assertions.assertTrue(new File("saves/" + resumeId + ".json").exists());
    }

    private void assertResumeFileDoesNotExist(String resumeId) {
        org.junit.jupiter.api.Assertions.assertFalse(new File("saves/" + resumeId + ".json").exists());
    }
}
