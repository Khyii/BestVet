package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.user.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VeterinarianService {
    private final VeterinarianRepository repository;
    private final StaffAccountService staffAccountService;

    public VeterinarianService(VeterinarianRepository repository, StaffAccountService staffAccountService) {
        this.repository = repository;
        this.staffAccountService = staffAccountService;
    }

    @Transactional
    public VeterinarianResponse create(VeterinarianRequest request) {
        staffAccountService.validateNewStaff(
                request.documentType(), request.documentNumber(), request.username());

        if (repository.existsByLicenceNumber(request.licenceNumber())) {
            throw new ConflictException("Ya existe un veterinario con ese número de licencia.");
        }

        Veterinarian vet = repository.save(new Veterinarian(
                request.documentType(),
                request.documentNumber(),
                request.firstName(),
                request.lastName(),
                request.email(),
                request.phone(),
                request.licenceNumber()
        ));

        staffAccountService.createAccount(vet, request.username(), request.password(), Role.VETERINARIAN);

        return VeterinarianResponse.from(vet);
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
