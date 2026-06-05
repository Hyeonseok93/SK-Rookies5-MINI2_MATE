package com.rookies5.Backend_MATE.exception;

public class EntityNotFoundException extends BusinessException {
    public EntityNotFoundException(ErrorCode errorCode, Object identifier) {
        super(errorCode, String.format("요청하신 리소스를 찾을 수 없습니다. (식별자: %s)", identifier));
    }
}