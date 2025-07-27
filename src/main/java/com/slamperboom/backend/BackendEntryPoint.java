package com.slamperboom.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.backend.bduAction.*;
import com.slamperboom.bdui.BDUIBuilder;
import com.slamperboom.resume.saves.IResumeManager;
import com.slamperboom.resume.saves.ResumeManager;

import java.util.Optional;

public class BackendEntryPoint {
    private final BDUIBuilder bduiBuilder;
    private final BDUActionPerformer bduActionPerformer;
    private final IResumeManager resumeManager = new ResumeManager();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BackendEntryPoint() {
        resumeManager.readAllResumes();
        objectMapper.registerModule(new JavaTimeModule());
        bduiBuilder = new BDUIBuilder(resumeManager, objectMapper);
        bduActionPerformer = new BDUActionPerformer(resumeManager, objectMapper);
    }

    public JsonNode getMainScreen() {
        return bduiBuilder.buildMainScreen();
    }

    public JsonNode getEditResumeScreen(String resumeId) {
        return bduiBuilder.buildEditScreen(resumeId);
    }

    public JsonNode getHeader() {
        return bduiBuilder.buildHeader();
    }

    public Optional<JsonNode> performBDUAction(BDUAction bduAction, JsonNode payload) {
        switch (bduAction) {
            case EXIT -> {
                return Optional.of(bduActionPerformer.performExit());
            }
            case CREATE_NEW -> {
                return Optional.of(bduActionPerformer.performCreateNew());
            }
            case LOAD -> {
                return Optional.of(bduActionPerformer.performLoad(payload));
            }
            case DELETE -> {
                return Optional.of(bduActionPerformer.performDelete(payload));
            }
            case UPDATE -> {
                return Optional.of(bduActionPerformer.performUpdate(payload));
            }
            case DUPLICATE -> {
                return Optional.of(bduActionPerformer.performDuplicate(payload));
            }
            case CHANGE_LOCALE -> {
                return Optional.of(bduActionPerformer.performChangeLocale(payload));
            }
            case OPEN_SAVE_DIR -> {
                bduActionPerformer.performOpenSaveDir();
                return Optional.empty();
            }
        }
        return Optional.empty();
    }
}
