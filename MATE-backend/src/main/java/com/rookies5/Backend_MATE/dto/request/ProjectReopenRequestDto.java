package com.rookies5.Backend_MATE.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProjectReopenRequestDto {

    @Min(value = 2, message = "Recruit count must be at least two.")
    private Integer recruitCount;

    @FutureOrPresent(message = "End date must be today or later.")
    private LocalDate endDate;
}
