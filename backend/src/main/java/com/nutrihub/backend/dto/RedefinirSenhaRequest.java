package com.nutrihub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(

    @NotBlank
    String token,

    @NotBlank
    @Size(min = 8, max = 255)
    String novaSenha,

    @NotBlank
    @Size(min = 8, max = 255)
    String novaSenhaConfirm

) {}