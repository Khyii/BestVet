package com.bestvet.bestvet.pet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

/** RF5: mismas validaciones que el registro, más el estado del paciente. */
public record PetUpdateRequest(
        @NotBlank String name,
        @NotBlank String species,
        String breed,
        @NotNull Sex sex,
        @PastOrPresent LocalDate birthDate,
        @Positive BigDecimal weight,
        @NotNull PetStatus status
) {}
