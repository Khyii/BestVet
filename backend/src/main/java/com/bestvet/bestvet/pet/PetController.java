package com.bestvet.bestvet.pet;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/pets")
public class PetController {
    private final PetService service;

    public PetController(PetService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PetResponse create(@Valid @RequestBody PetRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    public PetResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping
    public List<PetResponse> findByOwner(@RequestParam Long ownerId) {
        return service.findByOwner(ownerId);
    }
}
