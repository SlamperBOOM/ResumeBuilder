package com.slamperboom.utils;

import jakarta.enterprise.context.ApplicationScoped;

import java.io.File;
import java.io.IOException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class TempFilesManager {
    private final Map<String, File> tempFileMap;

    TempFilesManager() {
        tempFileMap = new HashMap<>(100);
    }

    public File createNewTempFile() throws IOException {
        String fileName = null;
        for (int i=0;i<10;++i) {
            fileName = UUID.randomUUID() + "_" + UUID.randomUUID();
            if (tempFileMap.containsKey(fileName)) {
                fileName = null;
            } else {
                break;
            }
        }
        if (fileName == null) {
            var oldestFile = tempFileMap.entrySet().stream().min(Comparator.comparingLong(o -> o.getValue().lastModified()));
            String oldestFileName = oldestFile.get().getKey();
            fileName = oldestFileName;
            tempFileMap.remove(oldestFileName);
        }
        File tempFile;
        tempFile = File.createTempFile(fileName, null);
        if (tempFile.exists() && !tempFile.delete()) {
            throw new IOException("Unable to delete old temp file");
        }
        if (!tempFile.createNewFile()) {
            throw new IOException("Unable to create new temp file");
        }
        tempFile.deleteOnExit();
        tempFileMap.put(fileName, tempFile);
        return tempFile;
    }
}
