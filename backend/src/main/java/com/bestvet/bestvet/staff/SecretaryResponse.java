package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;

public record SecretaryResponse(
        Long id,
        DocumentType documentType,
        String documentNumber,
        String firstName,
        String lastName,
        String email,
        String phone
) {
    public static SecretaryResponse from(Secretary s) {
        return new SecretaryResponse(
                s.getId(),
                s.getDocumentType(),
                s.getDocumentNumber(),
                s.getFirstName(),
                s.getLastName(),
                s.getEmail(),
                s.getPhone()
        );
    }
}
