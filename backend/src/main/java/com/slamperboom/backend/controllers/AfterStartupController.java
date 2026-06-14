package com.slamperboom.backend.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.bdui.DialogBuilders;
import com.slamperboom.exceptions.StartupExceptionHolder;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

@Produces(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class AfterStartupController {
    private final DialogBuilders dialogBuilders;

    @Path("/check_health")
    public Optional<JsonNode> checkServiceStartup() {
        if (StartupExceptionHolder.isErrorMessageOccurred()) {
            return Optional.of(dialogBuilders.buildMessageDialogWithTitle(
                    "Critical error occurred",
                    "Something went wrong while starting up the app. Close the app, redownload and reinstall it. " +
                            "Error: " + StartupExceptionHolder.getErrorMessage()
            ));
        }
        return Optional.empty();
    }
}
