package com.bestvet.bestvet.appointment;

import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.pet.Pet;
import com.bestvet.bestvet.staff.Secretary;
import com.bestvet.bestvet.staff.Veterinarian;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Arrays;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private Secretary createdBy;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String observations;

    protected Appointment() {}

    public Appointment(Pet pet, Veterinarian veterinarian, Secretary createdBy, LocalDateTime scheduledAt,
                       String reason, String observations) {
        this.pet = pet;
        this.veterinarian = veterinarian;
        this.createdBy = createdBy;
        this.scheduledAt = scheduledAt;
        this.reason = reason;
        this.observations = observations;
        this.status = AppointmentStatus.SCHEDULED;
    }

    public void confirm() {
        requireStatus(AppointmentStatus.SCHEDULED);
        this.status = AppointmentStatus.CONFIRMED;
    }

    public void cancel() {
        requireStatus(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED);
        this.status = AppointmentStatus.CANCELLED;
    }

    public void complete() {
        requireStatus(AppointmentStatus.CONFIRMED);
        this.status = AppointmentStatus.COMPLETED;
    }

    public void markNoShow() {
        requireStatus(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED);
        this.status = AppointmentStatus.DIDNT_SHOW;
    }

    public void reschedule(LocalDateTime newDate) {
        requireStatus(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED);
        this.scheduledAt = newDate;
        this.status = AppointmentStatus.SCHEDULED;
    }

    private void requireStatus(AppointmentStatus... allowed) {
        if (!Arrays.asList(allowed).contains(status)) {
            throw new ConflictException("No se puede realizar esta acción sobre una cita en el estado" + status);
        }
    }

    public Long getId() {
        return id;
    }

    public Pet getPet() {
        return pet;
    }

    public Veterinarian getVeterinarian() {
        return veterinarian;
    }

    public Secretary getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public String getReason() {
        return reason;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public String getObservations() {
        return observations;
    }
}
