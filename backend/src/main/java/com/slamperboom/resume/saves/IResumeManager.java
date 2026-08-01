package com.slamperboom.resume.saves;

import com.slamperboom.exceptions.UserException;

import java.io.File;
import java.io.IOException;
import java.util.List;

public interface IResumeManager {
    List<SimpleResume> getListOfResumes() throws UserException;
    void saveResume(String resumeId) throws UserException;
    void saveAll() throws UserException;
    void readAllResumes();
    String getSaveFolderPath();

    IResume getResume(String resumeID);
    String createResume(String resumeName) throws UserException;
    String duplicateResume(String duplicateResumeId) throws UserException;
    String importResumeFromFile(String fileName) throws UserException;
    void exportResumeToPDF(String resumeID, String savePath) throws UserException;
    void deleteResume(String resumeId) throws UserException;
}
