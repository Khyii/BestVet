package com.bestvet.bestvet.pet;

import com.bestvet.bestvet.owner.Owner;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.security.Provider;
import java.time.LocalDate;

@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String species;

    private String breed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sex sex;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(precision = 6, scale = 2)
    private BigDecimal weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetStatus status;

    protected Pet() {}

    public Pet(Owner owner, String name, String species, String breed,
               Sex sex, LocalDate birthDate, BigDecimal weight) {
        this.owner = owner;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.sex = sex;
        this.birthDate = birthDate;
        this.weight = weight;
        this.status = PetStatus.ACTIVE;
    }

    public void updateWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public void updateStatus(PetStatus status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Owner getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public String getSpecies() {
        return species;
    }

    public String getBreed() {
        return breed;
    }

    public Sex getSex() {
        return sex;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public PetStatus getStatus() {
        return status;
    }
}
