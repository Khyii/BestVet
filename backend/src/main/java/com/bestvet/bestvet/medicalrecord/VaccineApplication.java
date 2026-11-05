package com.bestvet.bestvet.medicalrecord;

import com.bestvet.bestvet.staff.Veterinarian;
import jakarta.persistence.*;

import java.time.LocalDate;

/** Aplicación de una vacuna del catálogo (RF12). Inmutable, igual que las consultas. */
@Entity
@Table(name = "vaccine_applications")
public class VaccineApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medical_record_id", nullable = false, updatable = false)
    private MedicalRecord medicalRecord;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vaccine_id", nullable = false, updatable = false)
    private Vaccine vaccine;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veterinarian_id", nullable = false, updatable = false)
    private Veterinarian administeredBy;

    @Column(name = "application_date", nullable = false, updatable = false)
    private LocalDate applicationDate;

    @Column(columnDefinition = "TEXT", updatable = false)
    private String observations;

    protected VaccineApplication() {}

    public VaccineApplication(MedicalRecord medicalRecord, Vaccine vaccine, Veterinarian administeredBy,
                              LocalDate applicationDate, String observations) {
        this.medicalRecord = medicalRecord;
        this.vaccine = vaccine;
        this.administeredBy = administeredBy;
        this.applicationDate = applicationDate;
        this.observations = observations;
    }

    public Long getId() { return id; }
    public MedicalRecord getMedicalRecord() { return medicalRecord; }
    public Vaccine getVaccine() { return vaccine; }
    public Veterinarian getAdministeredBy() { return administeredBy; }
    public LocalDate getApplicationDate() { return applicationDate; }
    public String getObservations() { return observations; }
}
