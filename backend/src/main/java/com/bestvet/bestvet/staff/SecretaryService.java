package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.user.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SecretaryService {
    private final SecretaryRepository repository;
    private final StaffAccountService staffAccountService;

    public SecretaryService(SecretaryRepository repository, StaffAccountService staffAccountService) {
        this.repository = repository;
        this.staffAccountService = staffAccountService;
    }

    @Transactional
    public SecretaryResponse create(SecretaryRequest request) {
        staffAccountService.validateNewStaff(
                request.documentType(), request.documentNumber(), request.username());

        Secretary sec = repository.save(new Secretary(
                request.documentType(),
                request.documentNumber(),
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone()
        ));

        staffAccountService.createAccount(sec, request.username(), request.password(), Role.SECRETARY);

        return SecretaryResponse.from(sec);
    }

    @Transactional(readOnly = true)
    public List<SecretaryResponse> findAll() {
        return repository.findAll().stream()
                .map(SecretaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SecretaryResponse findById(Long id) {
        Secretary sec = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Secretaria no encontrada."));

        return SecretaryResponse.from(sec);
    }
}
