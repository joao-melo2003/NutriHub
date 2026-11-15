package com.nutrihub.backend.dto;

import java.time.LocalTime;
import java.util.List;

import com.nutrihub.backend.enums.Dia_semana;

public record RotinaUpdateForms2Response(

    List<Dia_semana> diaSemanas,
    LocalTime horarioInicio,
    LocalTime horarioFim

) {}