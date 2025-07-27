package com.slamperboom.resume.saves;

import java.io.File;
import java.util.List;

public interface IResumeManager {
    List<SimpleResume> getListOfResumes();
    void saveResume(String resumeId);
    void saveAll();
    void readAllResumes();
    File getSaveFolder();

    IResume getResume(String resumeID);
    String createResume(String resumeName);
    String duplicateResume(String duplicateResumeId);
    void deleteResume(String resumeId);
}
