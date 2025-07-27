package com.slamperboom;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.slamperboom.backend.BackendEntryPoint;
import com.slamperboom.backend.bduAction.BDUAction;
import com.slamperboom.htmlConverter.HTMLConverter;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.ResumeManager;
import com.slamperboom.settings.DynamicSettings;

import java.io.IOException;

public class Main {
    public static void main(String[] args) {
//        System.out.println("Hello world!");
//        ResumeManager manager = new ResumeManager();
////        String resumeId = manager.createResume("resume");
////        manager.setCurrentResume(resumeId);
////        manager.saveResume(resumeId);
//        manager.readAllResumes();
//
//        IResume resume = manager.getCurrentResume();
//        System.out.println(resume.getJson().toPrettyString());
//        System.out.println();
//        String htmlDoc = HTMLConverter.processHTMLTemplate(resume, "simple_template");
//        System.out.println(htmlDoc);
//        try {
//            HTMLConverter.saveHTMLtoPDF(htmlDoc, "files/test_resume.pdf");
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//        manager.saveAll();
//        DynamicSettings.getInstance().saveSettings();

        BackendEntryPoint entryPoint = new BackendEntryPoint();
//        entryPoint.performBDUAction(BDUAction.DUPLICATE, new ObjectNode(JsonNodeFactory.instance).put("resume_id", "56c00d7b-bf7a-40ee-93c8-9069f8069900"));
//        entryPoint.performBDUAction(BDUAction.OPEN_SAVE_DIR, new ObjectNode(JsonNodeFactory.instance));
        System.out.println(entryPoint.getEditResumeScreen("56c00d7b-bf7a-40ee-93c8-9069f8069900").toPrettyString());
    }
}