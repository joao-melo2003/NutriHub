package com.nutrihub.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

import com.nutrihub.backend.enums.Distribuicao_rotina;
import com.nutrihub.backend.enums.Divisao_rotina;
import com.nutrihub.backend.enums.Grupo_treino;
import com.nutrihub.backend.enums.Objetivo_rotina;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RotinaRequest(

    @NotNull
    Objetivo_rotina objetivo,

    @NotNull
    @Positive
    BigDecimal altura,

    @NotNull
    @Positive
    BigDecimal peso,

    @NotNull
    Divisao_rotina divisao,

    @NotNull
    Distribuicao_rotina distribuicao,

    Map<Grupo_treino, Integer> preferenciasMusculares

) {}