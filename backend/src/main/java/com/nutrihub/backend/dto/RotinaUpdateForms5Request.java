package com.nutrihub.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RotinaUpdateForms5Request(

    @NotNull
    @Size(min = 5, message = "Selecione pelo menos 5 alimentos")
    List<@NotBlank String> alimentos

) {}