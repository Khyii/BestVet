package com.bestvet.bestvet.appointment;

import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.pet.Pet;
import com.bestvet.bestvet.pet.PetRepository;
import com.bestvet.bestvet.pet.PetStatus;
import com.bestvet.bestvet.staff.Veterinarian;
import com.bestvet.bestvet.staff.VeterinarianRepository;
import com.bestvet.bestvet.staff.Secretary;
import com.bestvet.bestvet.staff.SecretaryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    private static final List<AppointmentStatus> ACTIVE_STATUSES =
            List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED);

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final SecretaryRepository secretaryRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PetRepository petRepository,
                              VeterinarianRepository veterinarianRepository, SecretaryRepository secretaryRepository) {
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.veterinarianRepository = veterinarianRepository;
        this.secretaryRepository = secretaryRepository;
    }

    @Transactional
    public AppointmentResponse create(AppointmentRequest request) {
        Pet pet = petRepository.findById(request.petId())
                .orElseThrow(() -> new ResourceNotFoundException("Mascota no encontrada"));
        if (pet.getStatus() != PetStatus.ACTIVE) {
            throw new ConflictException("No se pueden agendar citas para una mascota inactiva o fallecida");
        }

        Veterinarian vet = veterinarianRepository.findById(request.veterinarianId())
                .orElseThrow(() -> new ResourceNotFoundException("Veterinario no encontrado"));

        Secretary sec = secretaryRepository.findById(request.secretaryId())
                .orElseThrow(() -> new ResourceNotFoundException("Secretario no encontrado"));

        checkAvailability(vet.getId(), request.scheduledAt());

        Appointment appointment = new Appointment(
                pet, vet, sec, request.scheduledAt(), request.reason(), request.observations());

        return AppointmentResponse.from(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public AppointmentResponse findById(Long id) {
        return AppointmentResponse.from(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findByDate(LocalDate date) {
        return appointmentRepository
                .findByScheduledAtGreaterThanEqualAndScheduledAtLessThanOrderByScheduledAt(
                        date.atStartOfDay(), date.plusDays(1).atStartOfDay())
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional
    public AppointmentResponse confirm(Long id) {
        Appointment appointment = getOrThrow(id);
        appointment.confirm();

        return AppointmentResponse.from(appointment);
    }

    @Transactional
    public AppointmentResponse cancel(Long id) {
        Appointment appointment = getOrThrow(id);
        appointment.cancel();

        return AppointmentResponse.from(appointment);
    }

    @Transactional
    public AppointmentResponse complete(Long id) {
        Appointment appointment = getOrThrow(id);
        appointment.complete();

        return AppointmentResponse.from(appointment);
    }

    @Transactional
    public AppointmentResponse markNoShow(Long id) {
        Appointment appointment = getOrThrow(id);
        appointment.markNoShow();

        return AppointmentResponse.from(appointment);
    }

    @Transactional
    public AppointmentResponse reschedule(Long id, RescheduleRequest request) {
        Appointment appointment = getOrThrow(id);
        checkAvailability(appointment.getVeterinarian().getId(), request.newDate());
        appointment.reschedule(request.newDate());

        return AppointmentResponse.from(appointment);
    }

    private Appointment getOrThrow(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada."));
    }

    private void checkAvailability(Long veterinarianId, LocalDateTime scheduledAt) {
        if (appointmentRepository.existsByVeterinarianIdAndScheduledAtAndStatusIn(
                veterinarianId, scheduledAt, ACTIVE_STATUSES)) {
            throw new ConflictException("El veterinario ya tiene una cita a esa hora");
        }
    }
}
