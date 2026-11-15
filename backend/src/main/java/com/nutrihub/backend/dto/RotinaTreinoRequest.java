package com.nutrihub.backend.dto;

import java.time.LocalTime;
import java.util.List;

import com.nutrihub.backend.enums.Dia_semana;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RotinaTreinoRequest(

    @NotBlank
    String idRotina,

    @NotEmpty
    List<@NotNull Dia_semana> diaSemanas,

    @NotNull
    LocalTime horarioInicio,

    @NotNull
    LocalTime horarioFim

) {}