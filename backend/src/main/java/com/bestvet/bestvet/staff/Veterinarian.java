package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import  jakarta.persistence.*;

@Entity
@Table(name = "veterinarians")
public class Veterinarian extends StaffMember {
    @Column(name = "licence_number", nullable = false, unique = true)
    private String licenceNumber;

    protected Veterinarian() {}

    public Veterinarian(DocumentType documentType, String documentNumber,
                        String firstName, String lastName, String email, String phone, String licenceNumber) {
        super(documentType, documentNumber, firstName, lastName, email, phone);
        this.licenceNumber = licenceNumber;
    }

    public String getLicenceNumber() {
        return licenceNumber;
    }
}
