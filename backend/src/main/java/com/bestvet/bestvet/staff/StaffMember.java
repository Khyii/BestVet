package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import jakarta.persistence.*;

@Entity
@Table(name = "staff_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"document_type", "document_number"}))
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class StaffMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @Column(name = "document_number", nullable = false)
    private String documentNumber;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    protected StaffMember() {}

    protected StaffMember(DocumentType documentType, String documentNumber,
                          String firstName, String lastName, String email, String phone) {
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }
}
