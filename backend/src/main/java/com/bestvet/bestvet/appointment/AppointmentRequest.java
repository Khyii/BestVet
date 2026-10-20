package com.bestvet.bestvet.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AppointmentRequest(
        @NotNull Long petId,
        @NotNull Long veterinarianId,
        @NotNull Long secretaryId,
        @NotNull @Future LocalDateTime scheduledAt,
        @NotBlank String reason,
        String observations
) {}
