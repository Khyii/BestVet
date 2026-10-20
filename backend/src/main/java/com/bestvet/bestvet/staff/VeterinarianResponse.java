package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;

public record VeterinarianResponse(
        Long id,
        DocumentType documentType,
        String documentNumber,
        String firstName,
        String lastName,
        String email,
        String phone,
        String licenseNumber
) {
    public static VeterinarianResponse from(Veterinarian v) {
        return new VeterinarianResponse(
                v.getId(),
                v.getDocumentType(),
                v.getDocumentNumber(),
                v.getFirstName(),
                v.getLastName(),
                v.getEmail(),
                v.getPhone(),
                v.getLicenceNumber()
        );
    }
}
