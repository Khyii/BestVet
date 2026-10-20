package com.bestvet.bestvet.appointment;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        Long petId,
        String petName,
        String ownerName,
        Long veterinarianId,
        String veterinarianName,
        Long secretaryId,
        String secretaryName,
        LocalDateTime scheduledAt,
        String reason,
        AppointmentStatus status,
        String observations
) {
    public static AppointmentResponse from(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getPet().getId(),
                a.getPet().getName(),
                a.getPet().getOwner().getFirstName() + " " + a.getPet().getOwner().getLastName(),
                a.getVeterinarian().getId(),
                a.getVeterinarian().getFirstName() + " " + a.getVeterinarian().getLastName(),
                a.getCreatedBy().getId(),
                a.getCreatedBy().getFirstName() + " " + a.getCreatedBy().getLastName(),
                a.getScheduledAt(),
                a.getReason(),
                a.getStatus(),
                a.getObservations()
        );
    }
}
