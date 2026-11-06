package com.bestvet.bestvet.pet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long>{
    List<Pet> findByOwnerId(Long ownerId);

    // Del registro más reciente al más antiguo (RF6); el propietario se carga en la misma consulta.
    @Query("select p from Pet p join fetch p.owner order by p.id desc")
    List<Pet> findAllWithOwnerNewestFirst();
}
