package com.bestvet.bestvet.staff;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secretaries")
public class SecretaryController {
    private final SecretaryService service;

    public SecretaryController(SecretaryService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SecretaryResponse create(@Valid @RequestBody SecretaryRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<SecretaryResponse> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public SecretaryResponse findById(@PathVariable Long id) { return service.findById(id); }
}
