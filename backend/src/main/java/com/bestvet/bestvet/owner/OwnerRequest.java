package com.bestvet.bestvet.owner;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OwnerRequest(
    @NotNull DocumentType documentType,
    @NotBlank String documentNumber,
    @NotBlank String firstName,
    @NotBlank String lastName,
    @NotBlank String phone,
    @Email String email,
    String address
) {}
