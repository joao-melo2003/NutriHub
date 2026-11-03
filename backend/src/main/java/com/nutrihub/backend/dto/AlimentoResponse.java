package com.nutrihub.backend.dto;

import com.nutrihub.backend.entity.Alimento;
import com.nutrihub.backend.enums.Categoria_alimentos;
import java.math.BigDecimal;

public record AlimentoResponse(
    String id,
    String nome,
    Categoria_alimentos categoria,
    Integer calorias,
    BigDecimal proteina,
    BigDecimal carboidratos,
    BigDecimal gorduras
) {
    public static AlimentoResponse fromEntity(Alimento alimento) {
        return new AlimentoResponse(
            alimento.getId(),
            alimento.getNome(),
            alimento.getCategoria(),
            alimento.getCalorias(),
            alimento.getProteina(),
            alimento.getCarboidratos(),
            alimento.getGorduras()
        );
    }
}