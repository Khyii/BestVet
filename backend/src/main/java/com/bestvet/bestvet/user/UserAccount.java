package com.bestvet.bestvet.user;

import com.bestvet.bestvet.staff.StaffMember;
import jakarta.persistence.*;

@Entity
@Table(name = "user_accounts")
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private boolean enabled = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Nulo solo para el administrador, que no tiene ficha de personal (RF2).
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_member_id", unique = true)
    private StaffMember staffMember;

    protected UserAccount() {}

    public UserAccount(String username, String passwordHash, Role role) {
        this(username, passwordHash, role, null);
    }

    public UserAccount(String username, String passwordHash, Role role, StaffMember staffMember) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.staffMember = staffMember;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Role getRole() {
        return role;
    }

    public StaffMember getStaffMember() {
        return staffMember;
    }
}
