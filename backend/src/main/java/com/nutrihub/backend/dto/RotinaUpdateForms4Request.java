package com.nutrihub.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RotinaUpdateForms4Request(

    @NotNull
    List<@NotBlank String> restricoes

) {}