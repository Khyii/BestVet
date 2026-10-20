package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SecretaryService {
    private final SecretaryRepository repository;

    public SecretaryService(SecretaryRepository repository) { this.repository = repository; }

    @Transactional
    public SecretaryResponse create(@Valid SecretaryRequest request) {
        if (repository.existsByDocumentTypeAndDocumentNumber(
                request.documentType(), request.documentNumber())) {
            throw new ConflictException("Ya existe un miembro del personal con este documento");
        }

        Secretary sec = new Secretary(
                request.documentType(),
                request.documentNumber(),
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone()
        );

        return SecretaryResponse.from(repository.save(sec));
    }

    @Transactional(readOnly = true)
    public List<SecretaryResponse> findAll() {
        return repository.findAll().stream()
                .map(SecretaryResponse::from)
                .toList();
    }

    @Transactional
    public SecretaryResponse findById(Long id) {
        Secretary sec = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Secretario no encontrado."));

        return SecretaryResponse.from(sec);
    }
}
