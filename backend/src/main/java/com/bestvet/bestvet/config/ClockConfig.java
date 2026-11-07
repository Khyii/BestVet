package com.bestvet.bestvet.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Reloj del sistema como bean, para que las reglas que dependen de la fecha
 * actual (RF8: no agendar en el pasado ni a más de 2 meses) puedan probarse con
 * un reloj fijo. Usa la zona horaria por defecto de la JVM, la misma que aplica
 * la validación @Future de los DTO.
 */
@Configuration
public class ClockConfig {
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
