package com.nutrihub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SenhaRequest (

    @NotBlank
    @Size(min = 8, max = 255)
    String senhaAntiga,

    @NotBlank
    @Size(min = 8, max = 255)
    String senha,

    @NotBlank
    @Size(min = 8, max = 255)
    String senhaConfirm
){}
