package com.bestvet.bestvet.user;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Permite al frontend validar las credenciales (HTTP Basic) y conocer el rol
 * del usuario autenticado. Es el punto de entrada del inicio de sesión (RF1).
 */
@RestController
@RequestMapping("/api/me")
public class CurrentUserController {
    private final CurrentUserService service;

    public CurrentUserController(CurrentUserService service) {
        this.service = service;
    }

    @GetMapping
    public MeResponse me(Authentication authentication) {
        return service.me(authentication.getName());
    }
}
