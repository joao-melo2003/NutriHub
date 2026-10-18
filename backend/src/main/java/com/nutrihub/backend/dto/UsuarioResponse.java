package com.nutrihub.backend.dto;

import java.time.LocalDate;

import com.nutrihub.backend.enums.Sexo_biologico;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.enums.Status_usuarios;

public record UsuarioResponse(
    String cpf,
    String nome,
    String email,
    LocalDate dataNascimento,
    Sexo_biologico sexo,
    Tipo_usuarios tipo,
    Status_usuarios status
) {}