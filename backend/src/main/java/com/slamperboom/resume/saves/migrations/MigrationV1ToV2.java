package com.slamperboom.resume.saves.migrations;

import com.fasterxml.jackson.databind.node.ObjectNode;

// v1 to v2: adds field "schemaVersion" and removes deprecated field "version_of_last_edit"
public class MigrationV1ToV2 implements IMigration{
    @Override
    public int fromVersion() {
        return 1;
    }

    @Override
    public int toVersion() {
        return 2;
    }

    @Override
    public ObjectNode migrate(ObjectNode data) {
        if (!data.has("schema_version")) {
            data.put("schema_version", 2);
        }
        data.remove("version_of_last_edit");
        return data;
    }
}
