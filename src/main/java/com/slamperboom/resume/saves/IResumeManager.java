package com.slamperboom.resume.saves;

import java.util.List;

public interface IResumeManager {
    List<SimpleResume> getListOfResumes();
    void saveResume(String resumeId);
    void saveAll();
    void readAllResumes();

    IResume getCurrentResume();
    void setCurrentResume(String resumeId);
    String createResume(String resumeName);
}
