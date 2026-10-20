package com.bestvet.bestvet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // Citas
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/*/complete").hasRole("VETERINARIAN")
                        .requestMatchers(HttpMethod.POST, "/api/appointments").hasRole("SECRETARY")
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/**").hasRole("SECRETARY")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**").hasAnyRole("SECRETARY", "VETERINARIAN")
                        // Dueños y Mascotas
                        .requestMatchers(HttpMethod.POST, "/api/owners", "/api/pets").hasRole("SECRETARY")
                        .requestMatchers(HttpMethod.GET, "/api/owners/**", "/api/pets/**").hasAnyRole("SECRETARY", "VETERINARIAN")
                        // Personal
                        .requestMatchers(HttpMethod.POST, "/api/veterinarians").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/veterinarians/**").hasAnyRole("SECRETARY", "VETERINARIAN", "ADMIN")
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
