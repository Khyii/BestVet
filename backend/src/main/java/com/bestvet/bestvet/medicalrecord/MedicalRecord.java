package com.bestvet.bestvet.medicalrecord;

import com.bestvet.bestvet.pet.Pet;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Historia clínica: se crea vacía junto con el paciente (RF4) y agrupa sus consultas y vacunas. */
@Entity
@Table(name = "medical_records")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pet_id", nullable = false, unique = true)
    private Pet pet;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected MedicalRecord() {}

    public MedicalRecord(Pet pet) {
        this.pet = pet;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Pet getPet() {
        return pet;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
