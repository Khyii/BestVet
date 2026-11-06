package com.bestvet.bestvet.pet;

import com.bestvet.bestvet.owner.Owner;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

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

    /** RF5: aplica la edición y devuelve false si ningún dato cambió. */
    public boolean update(String name, String species, String breed, Sex sex,
                          LocalDate birthDate, BigDecimal weight, PetStatus status) {
        boolean changed = !Objects.equals(this.name, name)
                || !Objects.equals(this.species, species)
                || !Objects.equals(this.breed, breed)
                || this.sex != sex
                || !Objects.equals(this.birthDate, birthDate)
                || !sameAmount(this.weight, weight)
                || this.status != status;
        if (changed) {
            this.name = name;
            this.species = species;
            this.breed = breed;
            this.sex = sex;
            this.birthDate = birthDate;
            this.weight = weight;
            this.status = status;
        }
        return changed;
    }

    // BigDecimal.equals distingue 4.5 de 4.50; para detectar cambios se compara el valor.
    private static boolean sameAmount(BigDecimal a, BigDecimal b) {
        return a == null ? b == null : b != null && a.compareTo(b) == 0;
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
