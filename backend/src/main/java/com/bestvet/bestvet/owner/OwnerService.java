package com.bestvet.bestvet.owner;

import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        Owner owner = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dueño no encontrado"));
        return OwnerResponse.from(owner);
    }
}
