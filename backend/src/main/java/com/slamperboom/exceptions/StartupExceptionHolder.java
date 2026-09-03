package com.slamperboom.exceptions;

import lombok.Getter;
import org.jboss.logging.Logger;

/**
 * This class is used to contain exceptions that occurring on startup of the application
 */
public class StartupExceptionHolder {
    private static final Logger logger = Logger.getLogger(StartupExceptionHolder.class);

    @Getter
    private static String errorMessage = null;

    private StartupExceptionHolder(){}

    /**
     * Use this function to add error message that occured on startup
     * @param message
     */
    public static void addException(String message) {
        logger.error(message);
        errorMessage = message;
    }

    public static boolean isErrorMessageOccurred() {
        return errorMessage != null;
    }
}
