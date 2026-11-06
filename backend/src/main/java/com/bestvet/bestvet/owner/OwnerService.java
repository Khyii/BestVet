package com.bestvet.bestvet.owner;

import com.bestvet.bestvet.common.BadRequestException;
import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OwnerService {
    private final OwnerRepository repository;

    public OwnerService(OwnerRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public OwnerResponse create(OwnerRequest request) {
        if (repository.existsByDocumentTypeAndDocumentNumber(
                request.documentType(), request.documentNumber())) {
            throw new ConflictException("Ya existe un dueño con este documento");
        }

        Owner owner = new Owner(
                request.documentType(),
                request.documentNumber(),
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.email(),
                request.address()
        );

        return OwnerResponse.from(repository.save(owner));
    }

    @Transactional(readOnly = true)
    public List<OwnerResponse> findAll() {
        return repository.findAll().stream()
                .map(OwnerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OwnerResponse findById(Long id) {
        return OwnerResponse.from(getOrThrow(id));
    }

    /** RF5: mismas validaciones que el registro; el documento no puede repetir el de otro propietario. */
    @Transactional
    public OwnerResponse update(Long id, OwnerRequest request) {
        Owner owner = getOrThrow(id);
        if (repository.existsByDocumentTypeAndDocumentNumberAndIdNot(
                request.documentType(), request.documentNumber(), id)) {
            throw new ConflictException("Ya existe otro dueño con este documento");
        }
        boolean changed = owner.update(request.documentType(), request.documentNumber(),
                request.firstName(), request.lastName(), request.phone(),
                request.email(), request.address());
        if (!changed) {
            throw new BadRequestException("No hay cambios para guardar");
        }
        return OwnerResponse.from(owner);
    }

    private Owner getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dueño no encontrado"));
    }
}
