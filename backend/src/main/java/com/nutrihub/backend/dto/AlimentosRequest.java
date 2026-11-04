package com.nutrihub.backend.dto;

import com.nutrihub.backend.enums.Categoria_alimentos;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AlimentosRequest(

    @NotBlank
    @Size(min = 3, max = 255)
    @Pattern(regexp = "^[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*$")
    String nome,

    @NotNull
    Categoria_alimentos categoria,

    @NotNull
    @PositiveOrZero
    Integer calorias,

    @NotNull
    @PositiveOrZero
    BigDecimal proteina,

    @NotNull
    @PositiveOrZero
    BigDecimal carboidratos,

    @NotNull
    @PositiveOrZero
    BigDecimal gorduras

) {}