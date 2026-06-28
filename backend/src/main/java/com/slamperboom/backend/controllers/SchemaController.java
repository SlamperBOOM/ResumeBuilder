package com.slamperboom.backend.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.bdui.DialogBuilders;
import com.slamperboom.bdui.BDUIBuilder;
import com.slamperboom.resume.saves.IResumeManager;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

@Path("/schema")
@Produces(MediaType.APPLICATION_JSON)
public class SchemaController {
    private final BDUIBuilder bduiBuilder;

    public SchemaController(IResumeManager resumeManager, DialogBuilders dialogBuilders) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        bduiBuilder = new BDUIBuilder(resumeManager, objectMapper, dialogBuilders);
    }

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
