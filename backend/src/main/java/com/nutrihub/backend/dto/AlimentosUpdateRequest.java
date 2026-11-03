package com.nutrihub.backend.dto;

import com.nutrihub.backend.enums.Categoria_alimentos;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AlimentosUpdateRequest(

    @NotBlank
    @Size(min = 2, max = 255)
    @Pattern(regexp = "^[\\p{L}][\\p{L}\\p{M}_]*$")
    String nome,

    Categoria_alimentos categoria,

    @PositiveOrZero
    Integer calorias,

    @PositiveOrZero
    BigDecimal proteina,

    @PositiveOrZero
    BigDecimal carboidratos,

    @PositiveOrZero
    BigDecimal gorduras

) {}