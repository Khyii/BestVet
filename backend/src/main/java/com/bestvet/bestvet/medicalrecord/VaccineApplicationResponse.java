package com.bestvet.bestvet.medicalrecord;

import java.time.LocalDate;

public record VaccineApplicationResponse(
        Long id,
        Long vaccineId,
        String vaccineName,
        String targetDisease,
        LocalDate applicationDate,
        String observations,
        Long veterinarianId,
        String veterinarianName
) {
    public static VaccineApplicationResponse from(VaccineApplication v) {
        return new VaccineApplicationResponse(
                v.getId(),
                v.getVaccine().getId(),
                v.getVaccine().getName(),
                v.getVaccine().getTargetDisease(),
                v.getApplicationDate(),
                v.getObservations(),
                v.getAdministeredBy().getId(),
                v.getAdministeredBy().getFirstName() + " " + v.getAdministeredBy().getLastName()
        );
    }
}
