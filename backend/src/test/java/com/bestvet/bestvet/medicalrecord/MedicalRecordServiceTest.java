package com.bestvet.bestvet.medicalrecord;

import com.bestvet.bestvet.appointment.Appointment;
import com.bestvet.bestvet.appointment.AppointmentRepository;
import com.bestvet.bestvet.appointment.AppointmentStatus;
import com.bestvet.bestvet.common.BadRequestException;
import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.owner.DocumentType;
import com.bestvet.bestvet.owner.Owner;
import com.bestvet.bestvet.pet.Pet;
import com.bestvet.bestvet.pet.PetRepository;
import com.bestvet.bestvet.pet.Sex;
import com.bestvet.bestvet.staff.CurrentStaffService;
import com.bestvet.bestvet.staff.Secretary;
import com.bestvet.bestvet.staff.Veterinarian;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Pruebas unitarias de MedicalRecordService: registro de consultas (RF11, CU18)
 * con su extensión para completar la cita de origen (RF9, CU16), consulta de la
 * historia clínica por rango de fechas (RF11, CU19) y registro de vacunas
 * (RF12, CU20). Los repositorios y CurrentStaffService son dobles de Mockito.
 */
@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceTest {

    private static final String USERNAME = "veterinario1";
    private static final Long PET_ID = 1L;
    private static final Long OTHER_PET_ID = 99L;
    private static final Long VET_ID = 2L;
    private static final Long RECORD_ID = 100L;
    private static final Long APPOINTMENT_ID = 10L;
    private static final Long VACCINE_ID = 5L;

    @Mock private MedicalRecordRepository medicalRecordRepository;
    @Mock private ConsultationRepository consultationRepository;
    @Mock private VaccineRepository vaccineRepository;
    @Mock private VaccineApplicationRepository vaccineApplicationRepository;
    @Mock private PetRepository petRepository;
    @Mock private AppointmentRepository appointmentRepository;
    @Mock private CurrentStaffService currentStaffService;

    private MedicalRecordService service;
    private Owner owner;
    private Pet pet;
    private Veterinarian vet;
    private Secretary secretary;
    private MedicalRecord record;

    @BeforeEach
    void setUp() {
        service = new MedicalRecordService(medicalRecordRepository, consultationRepository, vaccineRepository,
                vaccineApplicationRepository, petRepository, appointmentRepository, currentStaffService);

        owner = new Owner(DocumentType.CC, "1098000000", "Laura", "Gómez",
                "3001234567", "laura@correo.com", "Calle 1");
        pet = petWithId(PET_ID, "Toby");

        vet = new Veterinarian(DocumentType.CC, "1098111111", "Andrés", "Ruiz",
                "andres@bestvet.com", "3017654321", "TP-12345");
        ReflectionTestUtils.setField(vet, "id", VET_ID);

        secretary = new Secretary(DocumentType.CC, "1098222222", "Marta", "Díaz",
                "marta@bestvet.com", "3029876543");
        ReflectionTestUtils.setField(secretary, "id", 3L);

        record = new MedicalRecord(pet);
        ReflectionTestUtils.setField(record, "id", RECORD_ID);
    }

    // ---------- RF11 / CU18: registrar consulta ----------

    @Test
    @DisplayName("PU18 - Registrar una consulta sin cita de origen la guarda con el veterinario de la sesión")
    void registerConsultation_withoutAppointment_savesWithSessionVeterinarian() {
        stubPetRecordAndVet();
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(inv -> inv.getArgument(0));

        ConsultationResponse response = service.registerConsultation(PET_ID, consultationRequest(null), USERNAME);

        ArgumentCaptor<Consultation> saved = ArgumentCaptor.forClass(Consultation.class);
        verify(consultationRepository).save(saved.capture());
        assertThat(saved.getValue().getMedicalRecord()).isSameAs(record);
        assertThat(saved.getValue().getVeterinarian()).isSameAs(vet);
        assertThat(response.veterinarianId()).isEqualTo(VET_ID);
        assertThat(response.appointmentId()).isNull();
        verifyNoInteractions(appointmentRepository);
    }

    // ---------- RF9 / CU16: completar cita al registrar la consulta ----------

    @Test
    @DisplayName("PU19 - Registrar una consulta desde una cita confirmada completa la cita y las liga")
    void registerConsultation_fromConfirmedAppointment_completesAppointment() {
        Appointment appointment = appointmentFor(pet, AppointmentStatus.CONFIRMED);
        stubPetRecordAndVet();
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(appointment));
        when(consultationRepository.save(any(Consultation.class))).thenAnswer(inv -> inv.getArgument(0));

        ConsultationResponse response =
                service.registerConsultation(PET_ID, consultationRequest(APPOINTMENT_ID), USERNAME);

        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
        assertThat(response.appointmentId()).isEqualTo(APPOINTMENT_ID);
    }

    @Test
    @DisplayName("PU20 - Si la cita de origen no está confirmada, se rechaza y la consulta no se guarda")
    void registerConsultation_fromScheduledAppointment_throwsConflictAndDoesNotSave() {
        Appointment appointment = appointmentFor(pet, AppointmentStatus.SCHEDULED);
        stubPetRecordAndVet();
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() ->
                service.registerConsultation(PET_ID, consultationRequest(APPOINTMENT_ID), USERNAME))
                .isInstanceOf(ConflictException.class);
        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.SCHEDULED);
        verify(consultationRepository, never()).save(any());
    }

    @Test
    @DisplayName("PU21 - Una cita de origen de otro paciente se rechaza y la consulta no se guarda")
    void registerConsultation_appointmentOfAnotherPet_throwsBadRequest() {
        Appointment appointment = appointmentFor(petWithId(OTHER_PET_ID, "Luna"), AppointmentStatus.CONFIRMED);
        stubPetRecordAndVet();
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(appointment));

        assertThatThrownBy(() ->
                service.registerConsultation(PET_ID, consultationRequest(APPOINTMENT_ID), USERNAME))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no corresponde a este paciente");
        assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        verify(consultationRepository, never()).save(any());
    }

    @Test
    @DisplayName("PU22 - Una cita que ya tiene consulta registrada no admite una segunda consulta")
    void registerConsultation_appointmentAlreadyHasConsultation_throwsConflict() {
        Appointment appointment = appointmentFor(pet, AppointmentStatus.CONFIRMED);
        stubPetRecordAndVet();
        when(appointmentRepository.findById(APPOINTMENT_ID)).thenReturn(Optional.of(appointment));
        when(consultationRepository.existsByAppointmentId(APPOINTMENT_ID)).thenReturn(true);

        assertThatThrownBy(() ->
                service.registerConsultation(PET_ID, consultationRequest(APPOINTMENT_ID), USERNAME))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("ya tiene una consulta");
        verify(consultationRepository, never()).save(any());
    }

    // ---------- RF11 / CU19: consultar historia clínica ----------

    @Test
    @DisplayName("PU23 - La historia clínica acotada por fechas incluye ambos extremos y conserva el orden descendente")
    void getRecord_withRange_filtersInclusiveAndKeepsOrder() {
        when(petRepository.findById(PET_ID)).thenReturn(Optional.of(pet));
        when(medicalRecordRepository.findByPetId(PET_ID)).thenReturn(Optional.of(record));
        when(consultationRepository.findByMedicalRecordIdOrderByConsultationDateDesc(RECORD_ID)).thenReturn(List.of(
                consultationOn(LocalDateTime.of(2026, 10, 20, 17, 30), "Control"),
                consultationOn(LocalDateTime.of(2026, 10, 5, 9, 0), "Vómito"),
                consultationOn(LocalDateTime.of(2026, 9, 28, 11, 0), "Cojera")));
        Vaccine rabies = new Vaccine("Antirrábica", "Rabia", null);
        when(vaccineApplicationRepository.findByMedicalRecordIdOrderByApplicationDateDesc(RECORD_ID)).thenReturn(List.of(
                new VaccineApplication(record, rabies, vet, LocalDate.of(2026, 10, 1), null),
                new VaccineApplication(record, rabies, vet, LocalDate.of(2026, 9, 30), null)));

        MedicalRecordResponse response =
                service.getRecord(PET_ID, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 20));

        assertThat(response.consultations()).extracting(ConsultationResponse::reason)
                .containsExactly("Control", "Vómito");
        assertThat(response.vaccinations()).extracting(VaccineApplicationResponse::applicationDate)
                .containsExactly(LocalDate.of(2026, 10, 1));
    }

    @Test
    @DisplayName("PU24 - Un paciente sin historia clínica obtiene una historia nueva al primer acceso")
    void getRecord_patientWithoutRecord_createsRecord() {
        when(petRepository.findById(PET_ID)).thenReturn(Optional.of(pet));
        when(medicalRecordRepository.findByPetId(PET_ID)).thenReturn(Optional.empty());
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenAnswer(inv -> inv.getArgument(0));

        MedicalRecordResponse response = service.getRecord(PET_ID, null, null);

        verify(medicalRecordRepository).save(any(MedicalRecord.class));
        assertThat(response.petId()).isEqualTo(PET_ID);
        assertThat(response.consultations()).isEmpty();
        assertThat(response.vaccinations()).isEmpty();
    }

    // ---------- RF12 / CU20: registrar vacuna ----------

    @Test
    @DisplayName("PU25 - Registrar una vacuna que no está en el catálogo se rechaza y no se guarda")
    void registerVaccination_vaccineNotInCatalog_throwsNotFound() {
        stubPetRecordAndVet();
        when(vaccineRepository.findById(VACCINE_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.registerVaccination(PET_ID,
                new VaccineApplicationRequest(VACCINE_ID, LocalDate.of(2026, 11, 1), null), USERNAME))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("catálogo");
        verify(vaccineApplicationRepository, never()).save(any());
    }

    // ---------- Utilidades ----------

    private void stubPetRecordAndVet() {
        when(petRepository.findById(PET_ID)).thenReturn(Optional.of(pet));
        when(medicalRecordRepository.findByPetId(PET_ID)).thenReturn(Optional.of(record));
        when(currentStaffService.currentVeterinarian(USERNAME)).thenReturn(vet);
    }

    private ConsultationRequest consultationRequest(Long appointmentId) {
        return new ConsultationRequest(LocalDateTime.of(2026, 11, 7, 10, 0), "Control general",
                "Ninguno", "Sin hallazgos", "Sano", "Ninguno", null, appointmentId);
    }

    private Pet petWithId(Long id, String name) {
        Pet p = new Pet(owner, name, "Perro", "Criollo", Sex.MALE,
                LocalDate.of(2020, 5, 10), new BigDecimal("12.50"), null);
        ReflectionTestUtils.setField(p, "id", id);
        return p;
    }

    private Appointment appointmentFor(Pet appointmentPet, AppointmentStatus status) {
        Appointment appointment = new Appointment(appointmentPet, vet, secretary,
                LocalDateTime.of(2026, 11, 7, 10, 0), "Control general", null);
        ReflectionTestUtils.setField(appointment, "id", APPOINTMENT_ID);
        if (status == AppointmentStatus.CONFIRMED) {
            appointment.confirm();
        }
        return appointment;
    }

    private Consultation consultationOn(LocalDateTime date, String reason) {
        return new Consultation(record, vet, null, date, reason, null, null, "Diagnóstico", "Tratamiento", null);
    }
}
