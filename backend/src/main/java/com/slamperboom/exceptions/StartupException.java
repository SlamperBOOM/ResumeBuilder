package com.slamperboom.exceptions;

public class StartupException extends RuntimeException {
    public StartupException(String message) {
        super(message);
    }

    public StartupException(String message, Throwable err) {
        super(message, err);
    }
}
