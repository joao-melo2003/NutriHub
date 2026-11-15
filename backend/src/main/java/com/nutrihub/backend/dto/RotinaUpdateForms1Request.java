package com.nutrihub.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

import com.nutrihub.backend.enums.*;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RotinaUpdateForms1Request(

    @NotNull
    Objetivo_rotina objetivo,

    @NotNull
    @Positive
    BigDecimal peso,

    @NotNull
    @Positive
    BigDecimal altura,

    @NotNull
    Divisao_rotina divisao,

    @NotNull
    Distribuicao_rotina distribuicao,

    Map<Grupo_treino, Integer> preferenciasMusculares

) {}