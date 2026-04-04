package com.slamperboom.exceptions;

import com.slamperboom.translations.TranslationsManager;

public class UserException extends Exception{
    public UserException(ErrorCode errorCode, Throwable err) {
        super(TranslationsManager.getInstance().getErrorMessagesTranslations().get(errorCode.toString()).asText(), err);
    }

    public UserException(ErrorCode errorCode) {
        super(TranslationsManager.getInstance().getErrorMessagesTranslations().get(errorCode.toString()).asText());
    }
}
