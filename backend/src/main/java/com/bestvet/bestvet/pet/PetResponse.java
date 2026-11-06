package com.bestvet.bestvet.pet;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Incluye el contacto del propietario (RF7): celular obligatorio y correo opcional. */
public record PetResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String ownerPhone,
        String ownerEmail,
        String name,
        String species,
        String breed,
        Sex sex,
        LocalDate birthDate,
        BigDecimal weight,
        PetStatus status
) {
    public static PetResponse from(Pet pet) {
        return new PetResponse(
                pet.getId(),
                pet.getOwner().getId(),
                pet.getOwner().getFirstName() + " " + pet.getOwner().getLastName(),
                pet.getOwner().getPhone(),
                pet.getOwner().getEmail(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getSex(),
                pet.getBirthDate(),
                pet.getWeight(),
                pet.getStatus()
        );
    }
}
