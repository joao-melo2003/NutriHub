package com.nutrihub.backend.dto;

import com.nutrihub.backend.enums.Tipo_restricoes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RestricaoRequest(

    @NotBlank
    @Pattern(regexp = "^[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*$")
    @Size(min = 2, max = 255)
    String nome,

    @NotNull
    Tipo_restricoes tipo

) {}