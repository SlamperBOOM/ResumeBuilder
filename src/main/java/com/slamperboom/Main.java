package com.slamperboom;

import com.slamperboom.htmlConverter.HTMLConverter;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.resume.saves.ResumeManager;

import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello world!");
        ResumeManager manager = new ResumeManager();
//        String resumeId = manager.createResume("resume");
//        manager.setCurrentResume(resumeId);
//        manager.saveResume(resumeId);
        manager.readAllResumes();

        IResume resume = manager.getCurrentResume();
        System.out.println(resume.getJson().toPrettyString());
        System.out.println();
        String htmlDoc = HTMLConverter.processHTMLTemplate(resume, "simple_template");
        System.out.println(htmlDoc);
        try {
            HTMLConverter.saveHTMLtoPDF(htmlDoc, "files/test_resume.pdf");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}