package com.slamperboom.resume.saves.migrations;

import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
public class MigrationRegistry {
    public static final int CURRENT_SCHEMA_VERSION = 2;

    private static final List<IMigration> MIGRATIONS = List.of(
        new MigrationV1ToV2()
    );

    private final Map<Integer, IMigration> byFromVersion = MIGRATIONS.stream()
            .collect(Collectors.toMap(IMigration::fromVersion, m -> m));

    private void validateChainIsContiguous() {
        int version = 1;
        while (version < CURRENT_SCHEMA_VERSION) {
            IMigration migration = byFromVersion.get(version);
            if (migration == null) {
                throw new IllegalStateException(
                        "Migration chain has a gap at version " + version
                                + " -- did you forget to register a migration?");
            }
            version = migration.toVersion();
        }
    }

    public MigrationRegistry() {
        validateChainIsContiguous();
    }

    public ObjectNode migrateToLatest(ObjectNode data, int fromVersion) {
        int current = fromVersion;
        while (current < CURRENT_SCHEMA_VERSION) {
            IMigration migration = byFromVersion.get(current);
            if (migration == null) {
                throw new IllegalStateException(
                        "No migration registered starting from schema version " + current);
            }
            data = migration.migrate(data);
            current = migration.toVersion();
        }
        return data;
    }
}
