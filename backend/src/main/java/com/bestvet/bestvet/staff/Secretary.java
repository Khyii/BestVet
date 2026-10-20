package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import jakarta.persistence.*;

@Entity
@Table(name = "secretaries")
public class Secretary extends StaffMember {
    protected Secretary() {}

    public Secretary(DocumentType documentType, String documentNumber,
                     String firstName, String lastName, String email, String phone) {
        super(documentType, documentNumber, firstName, lastName, email, phone);
    }
}
