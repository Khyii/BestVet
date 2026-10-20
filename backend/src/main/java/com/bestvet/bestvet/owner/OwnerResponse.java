package com.bestvet.bestvet.owner;

public record OwnerResponse(
    Long id,
    DocumentType documentType,
    String documentNumber,
    String firstName,
    String lastName,
    String phone,
    String email,
    String address
) {
    public static OwnerResponse from(Owner owner) {
        return new OwnerResponse(
                owner.getId(),
                owner.getDocumentType(),
                owner.getDocumentNumber(),
                owner.getFirstName(),
                owner.getLastName(),
                owner.getPhone(),
                owner.getEmail(),
                owner.getAddress()
        );
    }
}
