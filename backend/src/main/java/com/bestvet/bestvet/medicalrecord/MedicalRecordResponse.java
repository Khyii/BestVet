package com.bestvet.bestvet.medicalrecord;

import java.time.LocalDateTime;
import java.util.List;

/** Historia clínica de un paciente; ambas listas van de la más reciente a la más antigua (RF11). */
public record MedicalRecordResponse(
        Long id,
        Long petId,
        String petName,
        LocalDateTime createdAt,
        List<ConsultationResponse> consultations,
        List<VaccineApplicationResponse> vaccinations
) {}
