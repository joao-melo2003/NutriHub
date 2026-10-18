package com.nutrihub.backend.dto;

import java.time.LocalDate;

import com.nutrihub.backend.enums.Sexo_biologico;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import com.nutrihub.backend.validation.CpfValido;

public record UsuarioRequest(

    @NotBlank
    @CpfValido
    @Size(min = 11, max = 11)
    String cpf,

    @NotBlank
    @Size(min = 4, max = 255)
    String nome,

    @NotBlank
    @Email
    @Size(max = 255)
    String email,

    @NotBlank
    @Size(min = 8, max = 255)
    String senha,

    @NotBlank
    @Size(min = 8, max = 255)
    String senhaConfirm,

    @NotNull
    @Past
    LocalDate dataNascimento,

    @NotNull
    Sexo_biologico sexo

) {}