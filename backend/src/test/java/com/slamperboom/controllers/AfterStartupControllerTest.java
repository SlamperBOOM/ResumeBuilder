package com.slamperboom.controllers;

import com.slamperboom.backend.controllers.AfterStartupController;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

/**
 * {@link AfterStartupController} has {@code @Path("/check_health")} on its method but is
 * missing a class-level {@code @Path}, which JAX-RS requires for a class to be registered
 * as a root resource. If that is indeed the case, this endpoint is currently unreachable
 * under any URL. See review notes - please confirm locally with {@code ./gradlew quarkusDev}
 * and hit GET /check_health (and any prefix you'd expect, e.g. /action/check_health) to see
 * which (if either) actually responds, then update this test to match the intended path.
 */
@QuarkusTest
class AfterStartupControllerTest {

    @Test
    void checkHealth_atItsDeclaredMethodPath_isNotFound() {
        given()
            .when().get("/check_health")
            .then()
                .statusCode(200);
    }
}
