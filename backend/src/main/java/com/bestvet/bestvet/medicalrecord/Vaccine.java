package com.bestvet.bestvet.medicalrecord;

import jakarta.persistence.*;

/** Vacuna del catálogo fijo (RF12). Sin control de existencias. */
@Entity
@Table(name = "vaccines")
public class Vaccine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "target_disease", nullable = false)
    private String targetDisease;

    @Column(columnDefinition = "TEXT")
    private String description;

    protected Vaccine() {}

    public Vaccine(String name, String targetDisease, String description) {
        this.name = name;
        this.targetDisease = targetDisease;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getTargetDisease() { return targetDisease; }
    public String getDescription() { return description; }
}
