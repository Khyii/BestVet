package com.bestvet.bestvet.user;

import com.bestvet.bestvet.common.ResourceNotFoundException;
import com.bestvet.bestvet.staff.StaffMember;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {
    private final UserAccountRepository repository;

    public CurrentUserService(UserAccountRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public MeResponse me(String username) {
        UserAccount account = repository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada"));

        StaffMember staff = account.getStaffMember();
        if (staff == null) {
            return new MeResponse(account.getUsername(), account.getRole(), null, null, null);
        }
        return new MeResponse(account.getUsername(), account.getRole(),
                staff.getId(), staff.getFirstName(), staff.getLastName());
    }
}
