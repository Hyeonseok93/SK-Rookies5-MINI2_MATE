package com.rookies5.Backend_MATE.exception;

import com.rookies5.Backend_MATE.exception.advice.DefaultExceptionAdvice;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;

class DefaultExceptionAdviceTest {

    @Test
    void dataIntegrityViolationReturnsConflictBusinessEnvelope() {
        var response = new DefaultExceptionAdvice()
                .handleDataIntegrityViolation(new DataIntegrityViolationException("constraint"));

        assertThat(response.getStatusCode().value()).isEqualTo(409);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getError().getCode())
                .isEqualTo(ErrorCode.DATA_INTEGRITY_VIOLATION.getCode());
    }
}
