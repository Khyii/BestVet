package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffMemberRepository {
    boolean existsByDocumentTypeAndDocumentNumber(DocumentType documentType, String documentNumber);
}
