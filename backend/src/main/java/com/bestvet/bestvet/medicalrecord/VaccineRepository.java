package com.bestvet.bestvet.medicalrecord;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VaccineRepository extends JpaRepository<Vaccine, Long> {
    List<Vaccine> findAllByOrderByNameAsc();
}
