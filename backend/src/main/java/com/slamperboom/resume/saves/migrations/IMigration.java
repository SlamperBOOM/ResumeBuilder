package com.slamperboom.resume.saves.migrations;

import com.fasterxml.jackson.databind.node.ObjectNode;

public interface IMigration {
    int fromVersion();
    int toVersion();
    ObjectNode migrate(ObjectNode data);
}
