package com.slamperboom.exceptions;

import com.slamperboom.managers.TranslationsManager;
import io.quarkus.runtime.Startup;
import jakarta.enterprise.context.ApplicationScoped;

@Startup
@ApplicationScoped
public class UserExceptionFactory {
    private static TranslationsManager translationsManager;

    UserExceptionFactory(TranslationsManager translationsManager) {
        UserExceptionFactory.translationsManager = translationsManager;
    }

    public static UserException construct(ErrorCode errorCode) {
        return new UserException(errorCode, resolveMessage(errorCode));
    }

    public static UserException construct(ErrorCode errorCode, Throwable cause) {
        return new UserException(errorCode, resolveMessage(errorCode), cause);
    }

    private static String resolveMessage(ErrorCode errorCode) {
        if (translationsManager == null) {
            return errorCode.toString();
        }
        return translationsManager.getErrorMessagesTranslations().get(errorCode.toString()).asText();
    }
}
