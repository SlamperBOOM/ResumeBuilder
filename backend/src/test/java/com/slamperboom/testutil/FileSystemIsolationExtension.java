package com.slamperboom.testutil;

import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;

import java.io.File;
import java.util.UUID;

/**
 * {@code ResumeManager} and {@code DynamicSettings} read/write real, hard-coded relative
 * directories on disk ("saves/" and "config/") instead of an injectable path (see review
 * notes). That makes it impossible to point them at a JUnit {@code @TempDir} directly.
 * <p>
 * This extension works around that: before each test it moves any existing "saves/" and
 * "config/" directories aside, and right after the test it deletes whatever the test wrote
 * and moves the original directories back. So the developer's real resumes/settings are
 * never read or overwritten by the tests, without needing to change production code.
 * <p>
 * Usage: {@code @ExtendWith(FileSystemIsolationExtension.class)} on a unit test that touches
 * {@code ResumeManager} directly, or on an {@code @QuarkusTest} integration test class.
 */
public class FileSystemIsolationExtension implements BeforeEachCallback, AfterEachCallback {

    private static final String[] MANAGED_DIRS = {"saves", "config"};
    private static final ExtensionContext.Namespace NAMESPACE =
            ExtensionContext.Namespace.create(FileSystemIsolationExtension.class);
    private static final String SUFFIX_KEY = "backupSuffix";

    @Override
    public void beforeEach(ExtensionContext context) {
        String suffix = ".bak." + UUID.randomUUID();
        context.getStore(NAMESPACE).put(SUFFIX_KEY, suffix);
        for (String dir : MANAGED_DIRS) {
            moveAside(new File(dir), new File(dir + suffix));
        }
    }

    @Override
    public void afterEach(ExtensionContext context) {
        String suffix = context.getStore(NAMESPACE).get(SUFFIX_KEY, String.class);
        for (String dir : MANAGED_DIRS) {
            File testDir = new File(dir);
            deleteRecursively(testDir);
            moveAside(new File(dir + suffix), testDir);
        }
    }

    private void moveAside(File source, File destination) {
        if (!source.exists()) {
            return;
        }
        if (!source.renameTo(destination)) {
            throw new IllegalStateException(
                    "Test isolation could not move " + source.getPath() + " to " + destination.getPath()
                            + " - check for open file handles or permission issues");
        }
    }

    private void deleteRecursively(File file) {
        if (!file.exists()) {
            return;
        }
        File[] children = file.listFiles();
        if (children != null) {
            for (File child : children) {
                deleteRecursively(child);
            }
        }
        file.delete();
    }
}
