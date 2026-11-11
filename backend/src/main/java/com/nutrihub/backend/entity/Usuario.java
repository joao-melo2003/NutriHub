package com.nutrihub.backend.entity;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

import com.nutrihub.backend.enums.Sexo_biologico;
import com.nutrihub.backend.enums.Tipo_usuarios;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import com.nutrihub.backend.enums.Status_usuarios;

@Entity
@Getter 
@Setter
@Table(name = "usuarios")
public class Usuario {
    
    @Id
    @Column(name = "CPF", length = 11, nullable = false, unique = true)
    private String cpf;

    @Column(name = "nome", length = 255, nullable = false)
    private String nome;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "senha", length = 255)
    private String senha;
    
    @Column(name = "dataNascimento", nullable = false)
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false)
    private Sexo_biologico sexo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private Tipo_usuarios tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status_usuarios status;

    @Column(name = "softdelete")
    private Boolean softdelete;

    @Column(name = "qtsenha", nullable = false)
    private Integer qtSenha;

    @Column(name = "emailVerificado")
    private Boolean emailVerificado;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<RestricoesAlimentares> restricoesAlimentares;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<PreferenciasAlimentares> preferenciasAlimentares;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<UserToken> userTokens;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Rotinas rotinas;

}