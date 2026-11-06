package com.bestvet.bestvet.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;
import java.time.Instant;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Respuestas 401/403 en JSON y en español (RNF10). El 401 se envía sin la
        // cabecera WWW-Authenticate para que el navegador no abra su propio diálogo
        // de credenciales cuando el frontend recibe un error de inicio de sesión.
        AuthenticationEntryPoint unauthorized = (request, response, ex) ->
                writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                        "Credenciales inválidas o sesión no iniciada");
        AccessDeniedHandler forbidden = (request, response, ex) ->
                writeError(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                        "Su rol no tiene permiso para realizar esta acción");

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(basic -> basic.authenticationEntryPoint(unauthorized))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(unauthorized)
                        .accessDeniedHandler(forbidden))
                .authorizeHttpRequests(auth -> auth
                        // Sesión
                        .requestMatchers(HttpMethod.GET, "/api/me").authenticated()
                        // Citas
                        .requestMatchers(HttpMethod.POST, "/api/appointments").hasRole("SECRETARY")
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/**").hasRole("SECRETARY")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**").hasAnyRole("SECRETARY", "VETERINARIAN")
                        // Historia clínica y vacunas: exclusivas del veterinario (RF11, RF12).
                        // Deben ir antes de la regla general de /api/pets/**.
                        .requestMatchers("/api/pets/*/medical-record", "/api/pets/*/medical-record/**").hasRole("VETERINARIAN")
                        .requestMatchers(HttpMethod.GET, "/api/vaccines").hasRole("VETERINARIAN")
                        // Propietarios y pacientes
                        .requestMatchers(HttpMethod.POST, "/api/owners", "/api/pets").hasRole("SECRETARY")
                        .requestMatchers(HttpMethod.PUT, "/api/owners/*", "/api/pets/*").hasRole("SECRETARY")
                        .requestMatchers(HttpMethod.GET, "/api/owners/**", "/api/pets/**").hasAnyRole("SECRETARY", "VETERINARIAN")
                        // Personal
                        .requestMatchers(HttpMethod.POST, "/api/veterinarians", "/api/secretaries").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/veterinarians/**").hasAnyRole("SECRETARY", "VETERINARIAN", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/secretaries/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    private static void writeError(HttpServletResponse response, int status, String error, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                "{\"timestamp\":\"" + Instant.now() + "\",\"status\":" + status
                        + ",\"error\":\"" + error + "\",\"message\":\"" + message + "\"}");
    }
}
