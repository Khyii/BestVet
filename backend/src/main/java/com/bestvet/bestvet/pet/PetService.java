package com.bestvet.bestvet.pet;

import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.medicalrecord.MedicalRecord;
import com.bestvet.bestvet.medicalrecord.MedicalRecordRepository;
import com.bestvet.bestvet.owner.Owner;
import com.bestvet.bestvet.owner.OwnerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mascota no encontrada"));

        return PetResponse.from(pet);
    }

    @Transactional(readOnly = true)
    public List<PetResponse> findByOwner(Long ownerId) {
        return petRepository.findByOwnerId(ownerId).stream()
                .map(PetResponse::from)
                .toList();
    }
}
