package com.bestvet.bestvet.pet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PetRequest(
        @NotNull Long ownerId,
        @NotBlank String name,
        @NotBlank String species,
        String breed,
        @NotNull Sex sex,
        @PastOrPresent LocalDate birthDate,
        @Positive BigDecimal weight,
        @Size(max = Pet.MAX_OBSERVATIONS,
              message = "Las observaciones no pueden superar los " + Pet.MAX_OBSERVATIONS + " caracteres")
        String observations
) {}
