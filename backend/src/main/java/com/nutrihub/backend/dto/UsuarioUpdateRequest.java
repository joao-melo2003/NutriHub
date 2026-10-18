package com.nutrihub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(

    @Size(min = 4, max = 255)
    String nome,

    @Email
    @Size(max = 255)
    String email

) {}