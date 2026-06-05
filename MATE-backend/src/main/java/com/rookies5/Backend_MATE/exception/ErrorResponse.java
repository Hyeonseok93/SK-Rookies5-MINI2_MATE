package com.rookies5.Backend_MATE.exception;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ErrorResponse {
    @Builder.Default
    private boolean success = false;
    private ErrorDetail error;
    private LocalDateTime timestamp;

    @Getter
    @Builder
    public static class ErrorDetail {
        private String code;
        private String message;
        private String detail;
        private List<FieldError> fieldErrors;
    }

    @Getter
    @Builder
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }
}