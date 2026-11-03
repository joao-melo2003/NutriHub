package com.nutrihub.backend.dto;

import com.nutrihub.backend.validation.CpfValido;

import jakarta.validation.constraints.NotBlank;

public record BanirRequest(
    
    @NotBlank
    @CpfValido
    String cpfUser
) {}
