package com.bestvet.bestvet.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

// La secretaria que crea la cita se toma del usuario autenticado, no de la petición (RF8).
public record AppointmentRequest(
        @NotNull Long petId,
        @NotNull Long veterinarianId,
        @NotNull @Future LocalDateTime scheduledAt,
        @NotBlank String reason,
        String observations
) {}
