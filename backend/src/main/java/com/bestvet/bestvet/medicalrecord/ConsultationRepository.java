package com.bestvet.bestvet.medicalrecord;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByMedicalRecordIdOrderByConsultationDateDesc(Long medicalRecordId);
    boolean existsByAppointmentId(Long appointmentId);
}
