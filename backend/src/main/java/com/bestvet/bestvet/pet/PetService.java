package com.bestvet.bestvet.pet;

import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.owner.Owner;
import com.bestvet.bestvet.owner.OwnerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PetService {
    private final PetRepository petRepository;
    private final OwnerRepository ownerRepository;

    public PetService(PetRepository petRepository, OwnerRepository ownerRepository) {
        this.petRepository = petRepository;
        this.ownerRepository = ownerRepository;
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

        return PetResponse.from(petRepository.save(pet));
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
