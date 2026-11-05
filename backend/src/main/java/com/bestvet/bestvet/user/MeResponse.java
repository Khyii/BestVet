package com.bestvet.bestvet.user;

public record MeResponse(
        String username,
        Role role,
        Long staffId,
        String firstName,
        String lastName
) {}
