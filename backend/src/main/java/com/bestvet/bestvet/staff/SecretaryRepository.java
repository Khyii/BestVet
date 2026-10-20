package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SecretaryRepository extends JpaRepository<Secretary, Long> {
    boolean existsByDocumentTypeAndDocumentNumber(DocumentType documentType, String documentNumber);
}
