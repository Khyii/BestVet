package com.bestvet.bestvet.pet;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
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

    /** RF6. Todos los parámetros son opcionales y se combinan entre sí. */
    @GetMapping
    public List<PetResponse> search(@RequestParam(required = false) String q,
                                    @RequestParam(required = false) String breed,
                                    @RequestParam(required = false) String owner,
                                    @RequestParam(required = false) Integer minAge,
                                    @RequestParam(required = false) Integer maxAge,
                                    @RequestParam(required = false) Long ownerId) {
        return service.search(q, breed, owner, minAge, maxAge, ownerId);
    }

    @PutMapping("/{id}")
    public PetResponse update(@PathVariable Long id, @Valid @RequestBody PetUpdateRequest request) {
        return service.update(id, request);
    }
}
