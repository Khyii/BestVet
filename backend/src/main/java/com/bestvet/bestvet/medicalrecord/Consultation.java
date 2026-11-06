package com.bestvet.bestvet.medicalrecord;

import com.bestvet.bestvet.appointment.Appointment;
import com.bestvet.bestvet.staff.Veterinarian;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Consulta de la historia clínica (RF11). Es inmutable: no tiene métodos de
 * modificación y sus columnas no son actualizables; una corrección se registra
 * como una nueva consulta.
 */
@Entity
@Table(name = "consultations")
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medical_record_id", nullable = false, updatable = false)
    private MedicalRecord medicalRecord;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false, updatable = false)
    private Veterinarian veterinarian;

    // Cita de origen, opcional: una consulta puede no venir de una cita (RF11, CU16).
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", unique = true, updatable = false)
    private Appointment appointment;

    @Column(name = "consultation_date", nullable = false, updatable = false)
    private LocalDateTime consultationDate;

    @Column(nullable = false, updatable = false)
    private String reason;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String symptoms;

    @Column(name = "physical_examination", columnDefinition = "TEXT", updatable = false)
    private String physicalExamination;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String diagnosis;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String treatment;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String observations;

    protected Consultation() {}

    public Consultation(MedicalRecord medicalRecord, Veterinarian veterinarian, Appointment appointment,
                        LocalDateTime consultationDate, String reason, String symptoms,
                        String physicalExamination, String diagnosis, String treatment, String observations) {
        this.medicalRecord = medicalRecord;
        this.veterinarian = veterinarian;
        this.appointment = appointment;
        this.consultationDate = consultationDate;
        this.reason = reason;
        this.symptoms = symptoms;
        this.physicalExamination = physicalExamination;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.observations = observations;
    }

    public Long getId() { return id; }
    public MedicalRecord getMedicalRecord() { return medicalRecord; }
    public Veterinarian getVeterinarian() { return veterinarian; }
    public Appointment getAppointment() { return appointment; }
    public LocalDateTime getConsultationDate() { return consultationDate; }
    public String getReason() { return reason; }
    public String getSymptoms() { return symptoms; }
    public String getPhysicalExamination() { return physicalExamination; }
    public String getDiagnosis() { return diagnosis; }
    public String getTreatment() { return treatment; }
    public String getObservations() { return observations; }
}
