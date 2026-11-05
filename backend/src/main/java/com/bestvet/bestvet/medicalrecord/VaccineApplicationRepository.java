package com.bestvet.bestvet.medicalrecord;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VaccineApplicationRepository extends JpaRepository<VaccineApplication, Long> {
    List<VaccineApplication> findByMedicalRecordIdOrderByApplicationDateDesc(Long medicalRecordId);
}
