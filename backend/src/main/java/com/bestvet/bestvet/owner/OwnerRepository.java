package com.bestvet.bestvet.owner;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OwnerRepository extends JpaRepository<Owner, Long>{
    boolean existsByDocumentTypeAndDocumentNumber(DocumentType documentType, String documentNumber);
}
