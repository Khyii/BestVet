package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.common.ConflictException;
import com.bestvet.bestvet.owner.DocumentType;
import com.bestvet.bestvet.user.Role;
import com.bestvet.bestvet.user.UserAccount;
import com.bestvet.bestvet.user.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Reglas comunes al registro de personal (RF2): documento único entre todo el
 * personal, nombre de usuario único y creación de la cuenta con contraseña cifrada.
 */
@Service
public class StaffAccountService {
    private final StaffMemberRepository staffMemberRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffAccountService(StaffMemberRepository staffMemberRepository,
                               UserAccountRepository userAccountRepository,
                               PasswordEncoder passwordEncoder) {
        this.staffMemberRepository = staffMemberRepository;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void validateNewStaff(DocumentType documentType, String documentNumber, String username) {
        if (staffMemberRepository.existsByDocumentTypeAndDocumentNumber(documentType, documentNumber)) {
            throw new ConflictException("Ya existe un miembro del personal con ese documento.");
        }
        if (userAccountRepository.existsByUsername(username)) {
            throw new ConflictException("El nombre de usuario ya está en uso.");
        }
    }

    public void createAccount(StaffMember staff, String username, String rawPassword, Role role) {
        userAccountRepository.save(
                new UserAccount(username, passwordEncoder.encode(rawPassword), role, staff));
    }
}
