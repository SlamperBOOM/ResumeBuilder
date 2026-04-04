package com.slamperboom.exceptions;

import lombok.Getter;

/**
 * This class is used to contain exceptions that occurring on startup of the application
 */
public class StartupExceptionHolder {
    @Getter
    private static String errorMessage = null;

    private StartupExceptionHolder(){}

    /**
     * Use this function to add error message that occured on startup
     * @param message
     */
    public static void addException(String message) {
        errorMessage = message;
    }

    public static boolean isErrorMessageOccurred() {
        return errorMessage != null;
    }
}
