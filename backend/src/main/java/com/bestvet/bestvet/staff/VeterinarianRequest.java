package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VeterinarianRequest(
        @NotNull DocumentType documentType,
        @NotBlank String documentNumber,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String phone,
        @NotBlank String licenceNumber,
        @NotBlank String username,
        @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String password
) {}
