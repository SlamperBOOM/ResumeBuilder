package com.slamperboom.backend.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.slamperboom.bdui.BDUIBuilder;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.RequiredArgsConstructor;

@Path("/schema")
@Produces(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class SchemaController {
    private final BDUIBuilder bduiBuilder;

    @GET
    @Path("/main_screen")
    public JsonNode getMainScreen() {
        return bduiBuilder.buildMainScreen();
    }

    @GET
    @Path("/edit_screen/{resumeId}")
    public JsonNode getEditScreen(String resumeId) {
        return bduiBuilder.buildEditScreen(resumeId);
    }

    @GET
    @Path("/header")
    public JsonNode getHeader() {
        return bduiBuilder.buildHeader();
    }

    @GET
    @Path("/language_dialog")
    public JsonNode getLanguageDialog() {
        return bduiBuilder.buildLanguageDialog();
    }

    @GET
    @Path("/templates/{resumeId}")
    public JsonNode getTemplates(String resumeId) {
        return bduiBuilder.buildTemplates(resumeId);
    }
}
