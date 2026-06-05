package com.rookies5.Backend_MATE.exception;

public class InvalidRequestException extends BusinessException {
    public InvalidRequestException(ErrorCode errorCode) {
        super(errorCode);
    }

    public InvalidRequestException(ErrorCode errorCode, String detail) {
        super(errorCode, detail);
    }
}