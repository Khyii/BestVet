package com.bestvet.bestvet.medicalrecord;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vaccines")
public class VaccineController {
    private final MedicalRecordService service;

    public VaccineController(MedicalRecordService service) {
        this.service = service;
    }

    @GetMapping
    public List<VaccineResponse> findAll() {
        return service.listVaccines();
    }
}
