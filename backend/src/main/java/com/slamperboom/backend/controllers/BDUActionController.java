package com.slamperboom.backend.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.backend.DTO.ExportPayload;
import com.slamperboom.backend.DTO.ImportPayload;
import com.slamperboom.backend.DTO.OpenLocalDirPayload;
import com.slamperboom.backend.DTO.UpdatePayload;
import com.slamperboom.bdui.DialogBuilders;
import com.slamperboom.bdui.BDUActionPerformer;
import com.slamperboom.htmlConvertion.HTMLConverter;
import com.slamperboom.managers.TranslationsManager;
import com.slamperboom.resume.saves.IResumeManager;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.Optional;

@Path("/action")
@Produces(MediaType.APPLICATION_JSON)
public class BDUActionController {
    private final BDUActionPerformer bduActionPerformer;

    public BDUActionController(IResumeManager resumeManager, DialogBuilders builders, TranslationsManager translationsManager,
                               HTMLConverter htmlConverter) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        bduActionPerformer = new BDUActionPerformer(resumeManager, objectMapper, builders, translationsManager, htmlConverter);
    }

    @POST
    @Path("/exit")
    public JsonNode performExit() {
        return bduActionPerformer.performExit();
    }

    @POST
    @Path("/create_new")
    public JsonNode performCreateNew() {
        return bduActionPerformer.performCreateNew();
    }

    @GET
    @Path("/load/{resumeId}")
    public JsonNode performLoad(String resumeId) {
        return bduActionPerformer.performLoad(resumeId);
    }

    @DELETE
    @Path("/delete/{resumeId}")
    public JsonNode performDelete(String resumeId) {
        return bduActionPerformer.performDelete(resumeId);
    }

    @DELETE
    @Path("/delete/confirm/{resumeId}")
    public JsonNode performDeleteConfirm(String resumeId) {
        return bduActionPerformer.performConfirmDelete(resumeId);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/update")
    public JsonNode performUpdate(UpdatePayload payload) {
        return bduActionPerformer.performUpdate(payload);
    }

    @POST
    @Path("/open_main_screen/{resumeId}")
    public JsonNode performOpenMainScreen(String resumeId) {
        return bduActionPerformer.performOpenMainScreen(resumeId);
    }

    @POST
    @Path("/duplicate/{resumeId}")
    public JsonNode performDuplicate(String resumeId) {
        return bduActionPerformer.performDuplicate(resumeId);
    }

    @POST
    @Path("/export")
    public Optional<JsonNode> performExport(ExportPayload payload) {
        return bduActionPerformer.performExport(payload);
    }

    @POST
    @Path("/import")
    public JsonNode performImport(ImportPayload payload) {
        return bduActionPerformer.performImport(payload.getFileName());
    }

    @GET
    @Path("/open_save_dir")
    public void openSaveDir() {
        bduActionPerformer.performOpenSaveDir();
    }

    @POST
    @Path("/open_local_dir")
    public Optional<JsonNode> openLocalDir(OpenLocalDirPayload payload) {
        return bduActionPerformer.performOpenDir(payload.getDirPath());
    }

    @POST
    @Path("/locale/set/{locale}")
    public JsonNode changeLocale(String locale) {
        return bduActionPerformer.performChangeLocale(locale);
    }

    @GET
    @Path("locales")
    public JsonNode getLocales() {
        return bduActionPerformer.performGetLocales();
    }

    @GET
    @Path("/about")
    public JsonNode about() {
        return bduActionPerformer.performOpenAbout();
    }

    @GET
    @Path("/help")
    public JsonNode help() {
        return bduActionPerformer.performOpenHelp();
    }

    @GET
    @Path("/onboarding_status")
    public Optional<JsonNode> onboardingStatus() {
        return bduActionPerformer.performCheckOnboarding();
    }

    @POST
    @Path("/onboarding_seen")
    public Optional<JsonNode> onboardingSeen() {
        return bduActionPerformer.performOnboardingSeen();
    }
}
