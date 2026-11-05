package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.user.UserAccount;
import com.bestvet.bestvet.user.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Obtiene la ficha de personal del usuario autenticado. Se busca por id en el
 * repositorio del subtipo en lugar de usar instanceof: con carga perezosa, la
 * referencia de UserAccount es un proxy de StaffMember y no del subtipo.
 */
@Service
public class CurrentStaffService {
    private final UserAccountRepository userAccountRepository;
    private final SecretaryRepository secretaryRepository;
    private final VeterinarianRepository veterinarianRepository;

    public CurrentStaffService(UserAccountRepository userAccountRepository,
                               SecretaryRepository secretaryRepository,
                               VeterinarianRepository veterinarianRepository) {
        this.userAccountRepository = userAccountRepository;
        this.secretaryRepository = secretaryRepository;
        this.veterinarianRepository = veterinarianRepository;
    }

    @Transactional(readOnly = true)
    public Secretary currentSecretary(String username) {
        return secretaryRepository.findById(staffIdOf(username))
                .orElseThrow(() -> new ResourceNotFoundException("La cuenta no está asociada a una secretaria"));
    }

    @Transactional(readOnly = true)
    public Veterinarian currentVeterinarian(String username) {
        return veterinarianRepository.findById(staffIdOf(username))
                .orElseThrow(() -> new ResourceNotFoundException("La cuenta no está asociada a un veterinario"));
    }

    private Long staffIdOf(String username) {
        UserAccount account = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada"));
        if (account.getStaffMember() == null) {
            throw new ResourceNotFoundException("La cuenta no está asociada a ningún miembro del personal");
        }
        return account.getStaffMember().getId();
    }
}
