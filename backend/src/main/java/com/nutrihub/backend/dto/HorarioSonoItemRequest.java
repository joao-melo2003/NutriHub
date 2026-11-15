package com.nutrihub.backend.dto;

import java.time.LocalTime;

import com.nutrihub.backend.enums.Dia_semana;

import jakarta.validation.constraints.NotNull;

public record HorarioSonoItemRequest(

    Dia_semana diaSemana,

    @NotNull
    LocalTime horarioDormir,

    @NotNull
    LocalTime horarioAcordar

) {}