package com.slamperboom.exceptions;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum ErrorCode {
    RESUME_SAVE_ERROR("resume_save_error"),
    UNABLE_TO_UPDATE_RESUME_BLOCK("unable_to_update_resume_block"),
    UNABLE_TO_DUPLICATE_RESUME("unable_to_duplicate_resume"),
    UNABLE_TO_DELETE_RESUME("unable_to_delete_resume"),
    ERROR_WHILE_SAVING_CONFIG("error_while_saving_config"),
    UNABLE_TO_SAVE_PDF("unable_to_save_pdf"),
    UNABLE_TO_IMPORT_RESUME("unable_to_import_resume"),
    RESUME_NOT_FOUND("resume_not_found"),
    UNABLE_TO_PERFORM_ACTION("unable_to_perform_action");

    private final String code;

    @Override
    public String toString(){
        return code;
    }
}
