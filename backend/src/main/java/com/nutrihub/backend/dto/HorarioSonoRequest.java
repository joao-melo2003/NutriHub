package com.nutrihub.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

public record HorarioSonoRequest(

    @NotBlank
    String idRotina,

    @NotNull
    Boolean horariosIguais,

    @Valid
    @NotEmpty
    List<HorarioSonoItemRequest> horarios

) {}