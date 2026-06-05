package com.rookies5.Backend_MATE.common;

import lombok.Getter;

@Getter
public class SuccessResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;

    // 1. 데이터와 메시지를 같이 보낼 때 (예: 조회, 생성 완료)
    public SuccessResponse(String message, T data) {
        this.success = true;
        this.message = message;
        this.data = data;
    }

    // 2. 데이터 없이 메시지만 보낼 때 (예: 삭제 완료, 로그아웃 완료)
    public SuccessResponse(String message) {
        this.success = true;
        this.message = message;
        this.data = null;
    }
}