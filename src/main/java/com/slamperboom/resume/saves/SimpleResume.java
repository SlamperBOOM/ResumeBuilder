package com.slamperboom.resume.saves;

import java.io.File;
import java.time.LocalDateTime;

public record SimpleResume(String resumeId, String resumeName, File path, LocalDateTime lastModificationDate) {
}
