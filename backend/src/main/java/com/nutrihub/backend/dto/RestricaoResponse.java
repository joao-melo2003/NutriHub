package com.nutrihub.backend.dto;

import com.nutrihub.backend.entity.Restricao;
import com.nutrihub.backend.enums.Tipo_restricoes;

public record RestricaoResponse(
    String id,
    String nome,
    Tipo_restricoes tipo
) {
    public static RestricaoResponse fromEntity(Restricao restricao) {
        return new RestricaoResponse(
            restricao.getId(),
            restricao.getNome(),
            restricao.getTipo()
        );
    }
}