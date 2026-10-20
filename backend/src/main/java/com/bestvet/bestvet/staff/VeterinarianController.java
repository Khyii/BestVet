package com.bestvet.bestvet.staff;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarians")
public class VeterinarianController {
    private final VeterinarianService service;

    public VeterinarianController(VeterinarianService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VeterinarianResponse create(@Valid @RequestBody VeterinarianRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<VeterinarianResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public VeterinarianResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }
}
