package com.nutrihub.backend.dto;

import com.nutrihub.backend.enums.Categoria_alimentos;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record AlimentosRequest(

    @NotBlank
    String nome,

    @NotNull
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
