package com.nutrihub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.nutrihub.backend.enums.Sexo_biologico;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.enums.Status_usuarios;

@Entity 
@Table (name = "usuarios")
public class Usuario {
    

    private String cpf;


    private String nome;


    private String email;


    private String senha;
    

    private LocalDate dataNascimento;


    private Sexo_biologico sexo;

    private Tipo_usuarios tipo;


    private Status_usuarios status;

}