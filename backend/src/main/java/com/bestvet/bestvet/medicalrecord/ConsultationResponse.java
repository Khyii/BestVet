package com.bestvet.bestvet.medicalrecord;

import java.time.LocalDateTime;

public record ConsultationResponse(
        Long id,
        LocalDateTime consultationDate,
        String reason,
        String symptoms,
        String physicalExamination,
        String diagnosis,
        String treatment,
        String observations,
        Long veterinarianId,
        String veterinarianName,
        Long appointmentId
) {
    public static ConsultationResponse from(Consultation c) {
        return new ConsultationResponse(
                c.getId(),
                c.getConsultationDate(),
                c.getReason(),
                c.getSymptoms(),
                c.getPhysicalExamination(),
                c.getDiagnosis(),
                c.getTreatment(),
                c.getObservations(),
                c.getVeterinarian().getId(),
                c.getVeterinarian().getFirstName() + " " + c.getVeterinarian().getLastName(),
                c.getAppointment() == null ? null : c.getAppointment().getId()
        );
    }
}
