package com.bestvet.bestvet.medicalrecord;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/** RF11 y RF12. No hay endpoints PUT, PATCH ni DELETE: las entradas son inmutables. */
@RestController
@RequestMapping("/api/pets/{petId}/medical-record")
public class MedicalRecordController {
    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) {
        this.service = service;
    }

    @GetMapping
    public MedicalRecordResponse get(@PathVariable Long petId,
                                     @RequestParam(required = false)
                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                     @RequestParam(required = false)
                                     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.getRecord(petId, from, to);
    }

    @PostMapping("/consultations")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultationResponse registerConsultation(@PathVariable Long petId,
                                                     @Valid @RequestBody ConsultationRequest request,
                                                     Authentication authentication) {
        return service.registerConsultation(petId, request, authentication.getName());
    }

    @PostMapping("/vaccinations")
    @ResponseStatus(HttpStatus.CREATED)
    public VaccineApplicationResponse registerVaccination(@PathVariable Long petId,
                                                          @Valid @RequestBody VaccineApplicationRequest request,
                                                          Authentication authentication) {
        return service.registerVaccination(petId, request, authentication.getName());
    }
}
