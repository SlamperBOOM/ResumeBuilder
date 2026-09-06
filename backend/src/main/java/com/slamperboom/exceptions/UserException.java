package com.slamperboom.exceptions;

import lombok.Getter;

/**
 * Exception shown to the user as a dialog. Always carries an already-translated message -
 * build instances via {@link UserExceptionFactory}, never directly, so translation lookup
 * stays out of this class entirely.
 */
@Getter
public class UserException extends Exception {
    private final ErrorCode errorCode;

    UserException(ErrorCode errorCode, String translatedMessage) {
        super(translatedMessage);
        this.errorCode = errorCode;
    }

    UserException(ErrorCode errorCode, String translatedMessage, Throwable cause) {
        super(translatedMessage, cause);
        this.errorCode = errorCode;
    }
}
