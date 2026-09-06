package com.slamperboom.resume.saves;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.slamperboom.exceptions.StartupExceptionHolder;
import com.slamperboom.resume.saves.migrations.MigrationRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@ApplicationScoped
public class ResumeLoader {
    private static final Logger logger = Logger.getLogger(ResumeLoader.class);

    private final ObjectMapper objectMapper;
    private final MigrationRegistry migrationRegistry;

    public ResumeLoader(MigrationRegistry migrationRegistry) {
        this.migrationRegistry = migrationRegistry;

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    public Resume load(Path file) throws IOException {
        ObjectNode root = (ObjectNode) objectMapper.readTree(file.toFile());

        int schemaVersion = root.has("schema_version")
                ? root.get("schema_version").asInt()
                : 1;

        if (schemaVersion > MigrationRegistry.CURRENT_SCHEMA_VERSION) {
            StartupExceptionHolder.addException("Resume " + file.getFileName() + " has schema version " + schemaVersion +
                    ", newer than this application supports (max " + MigrationRegistry.CURRENT_SCHEMA_VERSION + "). Update the app to open it.");
            return null;
        }

        if (schemaVersion < MigrationRegistry.CURRENT_SCHEMA_VERSION) {
            backupOriginal(file);
            root = migrationRegistry.migrateToLatest(root, schemaVersion);
            root.put("schema_version", MigrationRegistry.CURRENT_SCHEMA_VERSION);
            writeMigrated(file, root);
            logger.infof("Migrated resume %s: schema v%d -> v%d",
                    file.getFileName(), schemaVersion, MigrationRegistry.CURRENT_SCHEMA_VERSION);
        }

        return objectMapper.treeToValue(root, Resume.class);
    }

    private void backupOriginal(Path file) throws IOException {
        Path backup = file.resolveSibling(file.getFileName() + ".bak");
        Files.copy(file, backup, StandardCopyOption.REPLACE_EXISTING);
    }

    private void writeMigrated(Path file, ObjectNode migrated) throws IOException {
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), migrated);
    }
}
