package com.nutrihub.backend.dto;

import com.nutrihub.backend.enums.Tipo_restricoes;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RestricaoUpdateRequest(

    @Pattern(regexp = "^[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*$")
    @Size(min = 2, max = 255)
    String nome,

    Tipo_restricoes tipo

) {}