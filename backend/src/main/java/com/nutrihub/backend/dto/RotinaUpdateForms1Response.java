package com.nutrihub.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

import com.nutrihub.backend.enums.*;

public record RotinaUpdateForms1Response(

    Objetivo_rotina objetivo,
    BigDecimal peso,
    BigDecimal altura,
    Divisao_rotina divisao,
    Distribuicao_rotina distribuicao,
    Map<String, Integer> preferenciasMusculares

) {}