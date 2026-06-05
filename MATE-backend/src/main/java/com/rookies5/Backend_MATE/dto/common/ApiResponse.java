package com.rookies5.Backend_MATE.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;   // 성공 여부 (true/false)
    private T data;            // 실제 데이터 (UserDto, ProjectDto 등)
    private String message;    // 응답 메시지
    private LocalDateTime timestamp; // 응답 시간

    // 성공 응답을 쉽게 만들기 위한 정적 팩토리 메서드
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    // 데이터 없이 메시지만 보낼 때 (예: 삭제 성공)
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(null)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}