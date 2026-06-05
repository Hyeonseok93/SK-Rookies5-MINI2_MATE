package com.rookies5.Backend_MATE.exception;

public class AccessDeniedException extends BusinessException {
    public AccessDeniedException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AccessDeniedException(ErrorCode errorCode, String detail) {
        super(errorCode, detail);
    }
}