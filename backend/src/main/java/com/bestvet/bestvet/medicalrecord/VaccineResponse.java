package com.bestvet.bestvet.medicalrecord;

public record VaccineResponse(Long id, String name, String targetDisease, String description) {
    public static VaccineResponse from(Vaccine v) {
        return new VaccineResponse(v.getId(), v.getName(), v.getTargetDisease(), v.getDescription());
    }
}
