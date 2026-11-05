package com.bestvet.bestvet.medicalrecord;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * El diagnóstico y el tratamiento son opcionales en el backend: según RF11 el
 * sistema alerta si faltan y el veterinario decide si guarda así. La alerta la
 * muestra el frontend. El veterinario se toma de la sesión.
 */
public record ConsultationRequest(
        @NotNull LocalDateTime consultationDate,
        @NotBlank String reason,
        String symptoms,
        String physicalExamination,
        String diagnosis,
        String treatment,
        String observations,
        Long appointmentId
) {}
