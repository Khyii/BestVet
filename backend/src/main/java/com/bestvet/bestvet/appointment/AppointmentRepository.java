package com.bestvet.bestvet.appointment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByVeterinarianIdAndScheduledAtAndStatusIn(
            Long veterinarianId, LocalDateTime scheduledAt, Collection<AppointmentStatus> statuses);

    List<Appointment> findByScheduledAtGreaterThanEqualAndScheduledAtLessThanOrderByScheduledAt(
            LocalDateTime start, LocalDateTime end);
}
