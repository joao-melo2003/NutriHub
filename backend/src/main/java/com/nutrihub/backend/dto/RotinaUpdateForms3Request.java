package com.nutrihub.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RotinaUpdateForms3Request(

    @NotNull
    Boolean horariosIguais,

    @NotEmpty
    List<@NotNull @Valid HorarioSonoItemRequest> horarios

) {}