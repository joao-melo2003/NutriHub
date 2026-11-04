package com.nutrihub.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;

public record ExcluirContaRequest(
    
    @AssertTrue(message = "É necessário confirmar a exclusão da conta")
    boolean confirm,
    
    @NotBlank  
    String senha
) {}