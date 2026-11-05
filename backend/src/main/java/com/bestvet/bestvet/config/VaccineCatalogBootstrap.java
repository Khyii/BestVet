package com.bestvet.bestvet.config;

import com.bestvet.bestvet.medicalrecord.Vaccine;
import com.bestvet.bestvet.medicalrecord.VaccineRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Carga inicial del catálogo fijo de vacunas (RF12). Solo se ejecuta si el catálogo está vacío. */
@Component
public class VaccineCatalogBootstrap implements ApplicationRunner {
    private final VaccineRepository repository;

    public VaccineCatalogBootstrap(VaccineRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        repository.saveAll(List.of(
                new Vaccine("Antirrábica", "Rabia", "Perros y gatos"),
                new Vaccine("Polivalente canina", "Moquillo, parvovirus, hepatitis, leptospirosis, parainfluenza", "Perros"),
                new Vaccine("Bordetella", "Traqueobronquitis infecciosa canina", "Perros"),
                new Vaccine("Triple felina", "Panleucopenia, rinotraqueítis, calicivirus", "Gatos"),
                new Vaccine("Leucemia felina", "Virus de la leucemia felina", "Gatos")
        ));
    }
}
