package com.nutrihub.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmarEmailRequest(
    @NotBlank 
    String token
) {}
