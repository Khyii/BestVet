package com.bestvet.bestvet.medicalrecord;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record VaccineApplicationRequest(
        @NotNull Long vaccineId,
        @NotNull @PastOrPresent(message = "La fecha de aplicación no puede ser futura") LocalDate applicationDate,
        String observations
) {}
