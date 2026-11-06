package com.bestvet.bestvet.pet;

import com.bestvet.bestvet.common.BadRequestException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.common.TextNormalizer;
import com.bestvet.bestvet.medicalrecord.MedicalRecord;
import com.bestvet.bestvet.medicalrecord.MedicalRecordRepository;
import com.bestvet.bestvet.owner.Owner;
import com.bestvet.bestvet.owner.OwnerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
public class PetService {
    private final PetRepository petRepository;
    private final OwnerRepository ownerRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public PetService(PetRepository petRepository, OwnerRepository ownerRepository,
                      MedicalRecordRepository medicalRecordRepository) {
        this.petRepository = petRepository;
        this.ownerRepository = ownerRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Transactional
    public PetResponse create(PetRequest request) {
        Owner owner = ownerRepository.findById(request.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("Dueño no encontrado"));

        Pet pet = new Pet(
                owner,
                request.name(),
                request.species(),
                request.breed(),
                request.sex(),
                request.birthDate(),
                request.weight()
        );

        Pet saved = petRepository.save(pet);
        // RF4: el paciente se registra con su historia clínica vacía.
        medicalRecordRepository.save(new MedicalRecord(saved));

        return PetResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PetResponse findById(Long id) {
        return PetResponse.from(getOrThrow(id));
    }

    /**
     * RF6: nombre total o parcial, sin distinguir mayúsculas ni tildes; filtros
     * combinables por raza, edad en años y propietario (nombre o documento).
     * Sin criterios devuelve todos, del más reciente al más antiguo.
     * El filtrado se hace en memoria: suficiente para el volumen de una clínica.
     */
    @Transactional(readOnly = true)
    public List<PetResponse> search(String q, String breed, String owner,
                                    Integer minAge, Integer maxAge, Long ownerId) {
        if (minAge != null && maxAge != null && minAge > maxAge) {
            throw new BadRequestException("La edad mínima no puede ser mayor que la edad máxima");
        }

        List<Pet> candidates = ownerId != null
                ? petRepository.findByOwnerId(ownerId)
                : petRepository.findAllWithOwnerNewestFirst();

        LocalDate today = LocalDate.now();
        return candidates.stream()
                .filter(p -> TextNormalizer.containsIgnoringCaseAndAccents(p.getName(), q))
                .filter(p -> TextNormalizer.containsIgnoringCaseAndAccents(p.getBreed(), breed))
                .filter(p -> matchesOwner(p.getOwner(), owner))
                .filter(p -> matchesAge(p.getBirthDate(), minAge, maxAge, today))
                .map(PetResponse::from)
                .toList();
    }

    /** RF5: edición del paciente, incluido su estado. */
    @Transactional
    public PetResponse update(Long id, PetUpdateRequest request) {
        Pet pet = getOrThrow(id);
        boolean changed = pet.update(request.name(), request.species(), request.breed(),
                request.sex(), request.birthDate(), request.weight(), request.status());
        if (!changed) {
            throw new BadRequestException("No hay cambios para guardar");
        }
        return PetResponse.from(pet);
    }

    private Pet getOrThrow(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mascota no encontrada"));
    }

    private static boolean matchesOwner(Owner o, String criterion) {
        return TextNormalizer.containsIgnoringCaseAndAccents(
                o.getFirstName() + " " + o.getLastName() + " " + o.getDocumentNumber(), criterion);
    }

    // Con filtro de edad, los pacientes sin fecha de nacimiento quedan fuera.
    private static boolean matchesAge(LocalDate birthDate, Integer minAge, Integer maxAge, LocalDate today) {
        if (minAge == null && maxAge == null) {
            return true;
        }
        if (birthDate == null) {
            return false;
        }
        int age = Period.between(birthDate, today).getYears();
        return (minAge == null || age >= minAge) && (maxAge == null || age <= maxAge);
    }
}
