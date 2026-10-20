package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SecretaryRequest(
        @NotNull DocumentType documentType,
        @NotBlank String documentNumber,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String phone
) {}
