package com.bestvet.bestvet.appointment;

import com.bestvet.bestvet.common.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(@Valid @RequestBody AppointmentRequest request,
                                      Authentication authentication) {
        return service.create(request, authentication.getName());
    }

    @GetMapping("/{id}")
    public AppointmentResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    /**
     * RF10. Un día: ?date=2026-11-20. Un rango (calendario mensual):
     * ?from=2026-11-01&to=2026-11-30. En ambos casos se puede añadir &veterinarianId=.
     */
    @GetMapping
    public List<AppointmentResponse> find(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long veterinarianId) {
        if (date != null) {
            return service.findInRange(date, date, veterinarianId);
        }
        if (from == null || to == null) {
            throw new BadRequestException("Indique date, o from y to");
        }
        return service.findInRange(from, to, veterinarianId);
    }

    @PatchMapping("/{id}/confirm")
    public AppointmentResponse confirm(@PathVariable Long id) {
        return service.confirm(id);
    }

    @PatchMapping("/{id}/cancel")
    public AppointmentResponse cancel(@PathVariable Long id) {
        return service.cancel(id);
    }

    @PatchMapping("/{id}/didnt-show")
    public AppointmentResponse markDidntShow(@PathVariable Long id) {
        return service.markDidntShow(id);
    }

    @PatchMapping("/{id}/reschedule")
    public AppointmentResponse reschedule(@PathVariable Long id,
                                          @Valid @RequestBody RescheduleRequest request) {
        return service.reschedule(id, request);
    }
}
