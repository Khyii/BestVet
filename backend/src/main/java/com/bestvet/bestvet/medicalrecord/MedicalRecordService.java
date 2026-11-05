package com.bestvet.bestvet.medicalrecord;

import com.bestvet.bestvet.appointment.Appointment;
import com.bestvet.bestvet.appointment.AppointmentRepository;
import com.bestvet.bestvet.common.BadRequestException;
import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.pet.Pet;
import com.bestvet.bestvet.pet.PetRepository;
import com.bestvet.bestvet.staff.CurrentStaffService;
import com.bestvet.bestvet.staff.Veterinarian;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final ConsultationRepository consultationRepository;
    private final VaccineRepository vaccineRepository;
    private final VaccineApplicationRepository vaccineApplicationRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;
    private final CurrentStaffService currentStaffService;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                ConsultationRepository consultationRepository,
                                VaccineRepository vaccineRepository,
                                VaccineApplicationRepository vaccineApplicationRepository,
                                PetRepository petRepository,
                                AppointmentRepository appointmentRepository,
                                CurrentStaffService currentStaffService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.consultationRepository = consultationRepository;
        this.vaccineRepository = vaccineRepository;
        this.vaccineApplicationRepository = vaccineApplicationRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
        this.currentStaffService = currentStaffService;
    }

    /** CU19: consultas y vacunas del paciente, de la más reciente a la más antigua, acotables por fechas. */
    @Transactional
    public MedicalRecordResponse getRecord(Long petId, LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("La fecha inicial no puede ser posterior a la fecha final");
        }
        MedicalRecord record = getOrCreateRecord(findPet(petId));

        List<ConsultationResponse> consultations = consultationRepository
                .findByMedicalRecordIdOrderByConsultationDateDesc(record.getId()).stream()
                .filter(c -> inRange(c.getConsultationDate().toLocalDate(), from, to))
                .map(ConsultationResponse::from)
                .toList();

        List<VaccineApplicationResponse> vaccinations = vaccineApplicationRepository
                .findByMedicalRecordIdOrderByApplicationDateDesc(record.getId()).stream()
                .filter(v -> inRange(v.getApplicationDate(), from, to))
                .map(VaccineApplicationResponse::from)
                .toList();

        return new MedicalRecordResponse(record.getId(), record.getPet().getId(), record.getPet().getName(),
                record.getCreatedAt(), consultations, vaccinations);
    }

    /**
     * CU18, extendido por CU16: si la consulta indica una cita de origen, la cita
     * se completa en la misma transacción. Si la cita no está confirmada,
     * Appointment.complete() lanza ConflictException y la consulta no se guarda.
     */
    @Transactional
    public ConsultationResponse registerConsultation(Long petId, ConsultationRequest request, String username) {
        Pet pet = findPet(petId);
        MedicalRecord record = getOrCreateRecord(pet);
        Veterinarian vet = currentStaffService.currentVeterinarian(username);

        Appointment appointment = null;
        if (request.appointmentId() != null) {
            appointment = appointmentRepository.findById(request.appointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada."));
            if (!appointment.getPet().getId().equals(pet.getId())) {
                throw new BadRequestException("La cita indicada no corresponde a este paciente");
            }
            if (consultationRepository.existsByAppointmentId(appointment.getId())) {
                throw new ConflictException("La cita ya tiene una consulta registrada");
            }
            appointment.complete();
        }

        Consultation consultation = new Consultation(record, vet, appointment,
                request.consultationDate(), request.reason(), request.symptoms(),
                request.physicalExamination(), request.diagnosis(), request.treatment(),
                request.observations());

        return ConsultationResponse.from(consultationRepository.save(consultation));
    }

    /** CU20: la vacuna debe existir en el catálogo; la fecha futura se rechaza en la validación del DTO. */
    @Transactional
    public VaccineApplicationResponse registerVaccination(Long petId, VaccineApplicationRequest request,
                                                          String username) {
        MedicalRecord record = getOrCreateRecord(findPet(petId));
        Veterinarian vet = currentStaffService.currentVeterinarian(username);
        Vaccine vaccine = vaccineRepository.findById(request.vaccineId())
                .orElseThrow(() -> new ResourceNotFoundException("La vacuna no existe en el catálogo"));

        VaccineApplication application = new VaccineApplication(
                record, vaccine, vet, request.applicationDate(), request.observations());

        return VaccineApplicationResponse.from(vaccineApplicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<VaccineResponse> listVaccines() {
        return vaccineRepository.findAllByOrderByNameAsc().stream()
                .map(VaccineResponse::from)
                .toList();
    }

    private Pet findPet(Long petId) {
        return petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Mascota no encontrada"));
    }

    // Los pacientes registrados antes de este cambio no tienen historia: se crea al primer acceso.
    private MedicalRecord getOrCreateRecord(Pet pet) {
        return medicalRecordRepository.findByPetId(pet.getId())
                .orElseGet(() -> medicalRecordRepository.save(new MedicalRecord(pet)));
    }

    private static boolean inRange(LocalDate date, LocalDate from, LocalDate to) {
        return (from == null || !date.isBefore(from)) && (to == null || !date.isAfter(to));
    }
}
