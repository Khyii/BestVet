package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VeterinarianService {
    private final VeterinarianRepository repository;

    public VeterinarianService(VeterinarianRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public VeterinarianResponse create(VeterinarianRequest request) {
        if (repository.existsByDocumentTypeAndDocumentNumber(
                request.documentType(), request.documentNumber())) {
            throw new ConflictException("Ya existe un miembro del personal con ese documento.");
        }

        if (repository.existsByLicenceNumber(request.licenceNumber())) {
            throw new ConflictException("Ya existe un veterinario con ese número de licencia.");
        }

        Veterinarian vet = new Veterinarian(
                request.documentType(),
                request.documentNumber(),
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone(),
                request.licenceNumber()
        );

        return VeterinarianResponse.from(repository.save(vet));
    }

    @Transactional(readOnly = true)
    public List<VeterinarianResponse> findAll() {
        return repository.findAll().stream()
                .map(VeterinarianResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public VeterinarianResponse findById(Long id) {
        Veterinarian vet = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veterinario no encontrado."));

        return VeterinarianResponse.from(vet);
    }
}
