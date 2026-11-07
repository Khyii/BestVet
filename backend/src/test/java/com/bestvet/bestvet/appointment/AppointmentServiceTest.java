package com.bestvet.bestvet.appointment;

import com.bestvet.bestvet.common.BadRequestException;
import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.owner.DocumentType;
import com.bestvet.bestvet.owner.Owner;
import com.bestvet.bestvet.pet.Pet;
import com.bestvet.bestvet.pet.PetRepository;
import com.bestvet.bestvet.pet.PetStatus;
import com.bestvet.bestvet.pet.Sex;
import com.bestvet.bestvet.staff.CurrentStaffService;
import com.bestvet.bestvet.staff.Secretary;
import com.bestvet.bestvet.staff.Veterinarian;
import com.bestvet.bestvet.staff.VeterinarianRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias de AppointmentService: agendamiento (RF8, CU11), ciclo de
 * vida de la cita (RF9, CU12 a CU15) y consulta por rango de fechas (RF10, CU17).
 * Los repositorios y CurrentStaffService se reemplazan por dobles de Mockito,
 * por lo que no se requiere base de datos. El reloj es fijo para que las reglas
 * de fecha de RF8 no dependan del día en que se ejecutan las pruebas.
 */
@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    private static final ZoneId ZONE = ZoneId.of("America/Bogota");
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 7, 8, 0);
    private static final String USERNAME = "secretaria1";
    private static final Long PET_ID = 1L;
    private static final Long VET_ID = 2L;
    private static final Long SECRETARY_ID = 3L;
    private static final Long APPOINTMENT_ID = 10L;
    private static final LocalDateTime SLOT = LocalDateTime.of(2026, 12, 1, 9, 0);
    private static final LocalDateTime NEW_SLOT = LocalDateTime.of(2026, 12, 3, 15, 30);
    private static final List<AppointmentStatus> ACTIVE =
            List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED);

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private PetRepository petRepository;
    @Mock private VeterinarianRepository veterinarianRepository;
    @Mock private CurrentStaffService currentStaffService;

    private AppointmentService service;
    private Pet pet;
    private Veterinarian vet;
    private Secretary secretary;

    @BeforeEach
    void setUp() {
        Clock fixedClock = Clock.fixed(NOW.atZone(ZONE).toInstant(), ZONE);
        service = new AppointmentService(
                appointmentRepository, petRepository, veterinarianRepository, currentStaffService, fixedClock);

        Owner owner = new Owner(DocumentType.CC, "1098000000", "Laura", "Gómez",
                "3001234567", "laura@correo.com", "Calle 1");
        pet = new Pet(owner, "Toby", "Perro", "Criollo", Sex.MALE,
                LocalDate.of(2020, 5, 10), new BigDecimal("12.50"), null);
        ReflectionTestUtils.setField(pet, "id", PET_ID);

        vet = new Veterinarian(DocumentType.CC, "1098111111", "Andrés", "Ruiz",
                "andres@bestvet.com", "3017654321", "TP-12345");
        ReflectionTestUtils.setField(vet, "id", VET_ID);

        secretary = new Secretary(DocumentType.CC, "1098222222", "Marta", "Díaz",
                "marta@bestvet.com", "3029876543");
        ReflectionTestUtils.setField(secretary, "id", SECRETARY_ID);
    }

    // ---------- RF8 / CU11: agendar cita ----------

    @Test
    @DisplayName("PU01 - Agendar con datos válidos crea la cita programada y registra la secretaria de la sesión")
    void create_validRequest_savesScheduledAppointmentWithSessionSecretary() {
        stubCreateLookups();
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        AppointmentResponse response = service.create(request(), USERNAME);

        ArgumentCaptor<Appointment> saved = ArgumentCaptor.forClass(Appointment.class);
        verify(appointmentRepository).save(saved.capture());
        assertThat(saved.getValue().getStatus()).isEqualTo(AppointmentStatus.SCHEDULED);
        assertThat(saved.getValue().getCreatedBy()).isSameAs(secretary);
        assertThat(response.secretaryId()).isEqualTo(SECRETARY_ID);
        assertThat(response.scheduledAt()).isEqualTo(SLOT);
        verify(appointmentRepository).existsByVeterinarianIdAndScheduledAtAndStatusIn(VET_ID, SLOT, ACTIVE);
        verify(appointmentRepository).existsByPetIdAndScheduledAtAndStatusIn(PET_ID, SLOT, ACTIVE);
    }

    @ParameterizedTest(name = "estado del paciente = {0}")
    @EnumSource(value = PetStatus.class, names = {"INACTIVE", "DECEASED"})
    @DisplayName("PU02 - No se agendan citas a pacientes inactivos ni fallecidos")
    void create_petNotActive_throwsConflict(PetStatus status) {
        pet.updateStatus(status);
        when(petRepository.findById(PET_ID)).thenReturn(Optional.of(pet));

        assertThatThrownBy(() -> service.create(request(), USERNAME))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("inactiva o fallecida");
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("PU03 - Se rechaza agendar si el veterinario ya tiene una cita activa a esa hora")
    void create_veterinarianBusy_throwsConflict() {
        stubCreateLookups();
        when(appointmentRepository.existsByVeterinarianIdAndScheduledAtAndStatusIn(VET_ID, SLOT, ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> service.create(request(), USERNAME))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("veterinario ya tiene una cita");
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("PU04 - Se rechaza agendar si el paciente ya tiene una cita activa a esa hora con otro veterinario")
    void create_petBusy_throwsConflict() {
        stubCreateLookups();
        when(appointmentRepository.existsByPetIdAndScheduledAtAndStatusIn(PET_ID, SLOT, ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> service.create(request(), USERNAME))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("paciente ya tiene una cita");
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("PU05 - Se rechaza agendar en el momento actual o en el pasado")
    void create_notFutureDate_throwsBadRequest() {
        stubCreateLookups();

        assertThatThrownBy(() -> service.create(requestAt(NOW), USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("posteriores al momento actual");
        assertThatThrownBy(() -> service.create(requestAt(NOW.minusDays(1)), USERNAME))
                .isInstanceOf(BadRequestException.class);
        verify(appointmentRepository, never()).existsByVeterinarianIdAndScheduledAtAndStatusIn(any(), any(), any());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("PU06 - Se acepta agendar a exactamente 2 meses y se rechaza un minuto después")
    void create_twoMonthLimit_isInclusive() {
        LocalDateTime limit = NOW.plusMonths(2);
        stubCreateLookups();
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> service.create(requestAt(limit.plusMinutes(1)), USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("más de 2 meses");
        AppointmentResponse response = service.create(requestAt(limit), USERNAME);

        assertThat(response.scheduledAt()).isEqualTo(limit);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    // ---------- RF9 / CU12 a CU15: ciclo de vida de la cita ----------

    @Test
    @DisplayName("PU07 - Confirmar una cita programada la deja confirmada")
    void confirm_scheduled_becomesConfirmed() {
        stubFind(appointmentIn(AppointmentStatus.SCHEDULED));

        AppointmentResponse response = service.confirm(APPOINTMENT_ID);

        assertThat(response.status()).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    @Test
    @DisplayName("PU08 - Confirmar una cita que ya está confirmada se rechaza por conflicto de estado")
    void confirm_alreadyConfirmed_throwsConflict() {
        Appointment appointment = appointmentIn(AppointmentStatus.CONFIRMED);
        stubFind(appointment);

        assertThatThrownBy(() -> service.confirm(APPOINTMENT_ID))
                .isInstanceOf(ConflictException.class);
        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    @Test
    @DisplayName("PU09 - Cancelar una cita confirmada la deja cancelada")
    void cancel_confirmed_becomesCancelled() {
        stubFind(appointmentIn(AppointmentStatus.CONFIRMED));

        AppointmentResponse response = service.cancel(APPOINTMENT_ID);

        assertThat(response.status()).isEqualTo(AppointmentStatus.CANCELLED);
    }

    @Test
    @DisplayName("PU10 - Marcar inasistencia en una cita programada la deja como no asistió")
    void markDidntShow_scheduled_becomesDidntShow() {
        stubFind(appointmentIn(AppointmentStatus.SCHEDULED));

        AppointmentResponse response = service.markDidntShow(APPOINTMENT_ID);

        assertThat(response.status()).isEqualTo(AppointmentStatus.DIDNT_SHOW);
    }

    @ParameterizedTest(name = "estado final = {0}")
    @EnumSource(value = AppointmentStatus.class, names = {"CANCELLED", "COMPLETED", "DIDNT_SHOW"})
    @DisplayName("PU11 - Una cita en estado final no admite confirmar, cancelar, marcar inasistencia ni reprogramar")
    void finalStates_rejectEverySecretaryAction(AppointmentStatus finalStatus) {
        Appointment appointment = appointmentIn(finalStatus);
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() -> service.confirm(APPOINTMENT_ID)).isInstanceOf(ConflictException.class);
        assertThatThrownBy(() -> service.cancel(APPOINTMENT_ID)).isInstanceOf(ConflictException.class);
        assertThatThrownBy(() -> service.markDidntShow(APPOINTMENT_ID)).isInstanceOf(ConflictException.class);
        assertThatThrownBy(() -> service.reschedule(APPOINTMENT_ID, new RescheduleRequest(NEW_SLOT)))
                .isInstanceOf(ConflictException.class);
        assertThat(appointment.getStatus()).isEqualTo(finalStatus);
        assertThat(appointment.getScheduledAt()).isEqualTo(SLOT);
    }

    @Test
    @DisplayName("PU12 - Reprogramar una cita confirmada cambia la fecha y la devuelve a programada")
    void reschedule_confirmed_changesDateAndReturnsToScheduled() {
        stubFind(appointmentIn(AppointmentStatus.CONFIRMED));

        AppointmentResponse response = service.reschedule(APPOINTMENT_ID, new RescheduleRequest(NEW_SLOT));

        assertThat(response.scheduledAt()).isEqualTo(NEW_SLOT);
        assertThat(response.status()).isEqualTo(AppointmentStatus.SCHEDULED);
        verify(appointmentRepository).existsByVeterinarianIdAndScheduledAtAndStatusIn(VET_ID, NEW_SLOT, ACTIVE);
        verify(appointmentRepository).existsByPetIdAndScheduledAtAndStatusIn(PET_ID, NEW_SLOT, ACTIVE);
    }

    @Test
    @DisplayName("PU13 - Reprogramar a un horario ocupado del veterinario se rechaza y la cita no cambia")
    void reschedule_veterinarianBusy_throwsConflictAndKeepsDate() {
        Appointment appointment = appointmentIn(AppointmentStatus.SCHEDULED);
        stubFind(appointment);
        when(appointmentRepository.existsByVeterinarianIdAndScheduledAtAndStatusIn(VET_ID, NEW_SLOT, ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> service.reschedule(APPOINTMENT_ID, new RescheduleRequest(NEW_SLOT)))
                .isInstanceOf(ConflictException.class);
        assertThat(appointment.getScheduledAt()).isEqualTo(SLOT);
    }

    @Test
    @DisplayName("PU14 - Reprogramar a una hora en que el paciente ya tiene otra cita se rechaza")
    void reschedule_petBusy_throwsConflictAndKeepsDate() {
        Appointment appointment = appointmentIn(AppointmentStatus.CONFIRMED);
        stubFind(appointment);
        when(appointmentRepository.existsByPetIdAndScheduledAtAndStatusIn(PET_ID, NEW_SLOT, ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> service.reschedule(APPOINTMENT_ID, new RescheduleRequest(NEW_SLOT)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("paciente ya tiene una cita");
        assertThat(appointment.getScheduledAt()).isEqualTo(SLOT);
        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
    }

    @Test
    @DisplayName("PU15 - Reprogramar a una fecha pasada o a más de 2 meses se rechaza y la cita no cambia")
    void reschedule_dateOutOfRange_throwsBadRequestAndKeepsDate() {
        Appointment appointment = appointmentIn(AppointmentStatus.SCHEDULED);
        stubFind(appointment);

        assertThatThrownBy(() -> service.reschedule(APPOINTMENT_ID, new RescheduleRequest(NOW.minusHours(1))))
                .isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> service.reschedule(APPOINTMENT_ID,
                new RescheduleRequest(NOW.plusMonths(2).plusDays(1))))
                .isInstanceOf(BadRequestException.class);
        assertThat(appointment.getScheduledAt()).isEqualTo(SLOT);
    }

    // ---------- RF10 / CU17: calendario ----------

    @Test
    @DisplayName("PU16 - Consultar el calendario con fecha inicial posterior a la final se rechaza")
    void findInRange_fromAfterTo_throwsBadRequest() {
        LocalDate from = LocalDate.of(2026, 12, 31);
        LocalDate to = LocalDate.of(2026, 12, 1);

        assertThatThrownBy(() -> service.findInRange(from, to, null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("PU17 - El calendario filtrado por veterinario incluye el último día del rango completo")
    void findInRange_withVeterinarian_queriesWholeLastDay() {
        LocalDate from = LocalDate.of(2026, 11, 1);
        LocalDate to = LocalDate.of(2026, 11, 30);

        service.findInRange(from, to, VET_ID);

        verify(appointmentRepository)
                .findByVeterinarianIdAndScheduledAtGreaterThanEqualAndScheduledAtLessThanOrderByScheduledAt(
                        VET_ID, LocalDateTime.of(2026, 11, 1, 0, 0), LocalDateTime.of(2026, 12, 1, 0, 0));
        verify(appointmentRepository, never())
                .findByScheduledAtGreaterThanEqualAndScheduledAtLessThanOrderByScheduledAt(any(), any());
    }

    // ---------- Utilidades ----------

    private AppointmentRequest request() {
        return requestAt(SLOT);
    }

    private AppointmentRequest requestAt(LocalDateTime scheduledAt) {
        return new AppointmentRequest(PET_ID, VET_ID, scheduledAt, "Vacunación anual", null);
    }

    private void stubCreateLookups() {
        when(petRepository.findById(PET_ID)).thenReturn(Optional.of(pet));
        when(veterinarianRepository.findById(VET_ID)).thenReturn(Optional.of(vet));
        when(currentStaffService.currentSecretary(USERNAME)).thenReturn(secretary);
    }

    private void stubFind(Appointment appointment) {
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(appointment));
    }

    /** Construye una cita y la lleva al estado pedido usando solo las transiciones permitidas por RF9. */
    private Appointment appointmentIn(AppointmentStatus status) {
        Appointment appointment = new Appointment(pet, vet, secretary, SLOT, "Vacunación anual", null);
        ReflectionTestUtils.setField(appointment, "id", APPOINTMENT_ID);
        switch (status) {
            case SCHEDULED -> { }
            case CONFIRMED -> appointment.confirm();
            case CANCELLED -> appointment.cancel();
            case DIDNT_SHOW -> appointment.markDidntShow();
            case COMPLETED -> {
                appointment.confirm();
                appointment.complete();
            }
        }
        return appointment;
    }
}
