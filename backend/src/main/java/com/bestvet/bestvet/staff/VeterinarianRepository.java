package com.bestvet.bestvet.staff;

import com.bestvet.bestvet.owner.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeterinarianRepository extends JpaRepository<Veterinarian, Long> {
    boolean existsByDocumentTypeAndDocumentNumber(DocumentType documentType, String documentNumber);
    boolean existsByLicenceNumber(String licenseNumber);
}
