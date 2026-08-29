package com.slamperboom.managers;

import jakarta.enterprise.context.ApplicationScoped;

import java.io.File;
import java.io.IOException;

@ApplicationScoped
public class TempFilesManager {

    public File createNewTempFile() throws IOException {
        File tempFile = File.createTempFile("resumebuilder_", null);
        tempFile.deleteOnExit();
        return tempFile;
    }
}
