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
    void load_forAnyId_returnsOpenEditScreen() {
        // performLoad() never checks whether the resume actually exists - it will happily
        // "open" a screen for an id that was never created. See review notes.
        given()
            .when().get("/action/load/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_EDIT_SCREEN"))
                .body("payload.resume_id", equalTo("does-not-exist"));
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
    void delete_forUnknownResume_currentlyFailsWithServerError() {
        given()
            .when().delete("/action/delete/does-not-exist")
            .then()
                .statusCode(greaterThanOrEqualTo(200));
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
    void deleteConfirm_forUnknownResume_silentlySucceeds() {
        // deleteResume() just returns if the id isn't found - no error is surfaced to the
        // frontend at all. See review notes (contrast with delete_forUnknownResume above).
        given()
            .when().delete("/action/delete/confirm/does-not-exist")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("OPEN_MAIN_SCREEN"));
    }

    @Test
    void importResume_withAMissingFile_returnsAMessageDialogWithBlankText() {
        // Every entry in error_messages.*.json is currently an empty string, so every
        // UserException-driven error dialog in the app shows a blank message to the user.
        // This test pins that down concretely for the import flow. See review notes.
        given()
            .contentType(ContentType.JSON)
            .body("{\"file_name\":\"does-not-exist.json\"}")
            .when().post("/action/import")
            .then()
                .statusCode(200)
                .body("frontend_action", equalTo("SHOW_MESSAGE"))
                .body("payload.text", equalTo(""));
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
                // language dialog translations should now come from the "ru" bundle
                .body("translations", notNullValue());

        // restore default locale so later tests in the (shared, static) DynamicSettings
        // singleton aren't affected by this one - see review notes on global mutable state.
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
                .body("frontend_action", equalTo("OPEN_ABOUT"));
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
