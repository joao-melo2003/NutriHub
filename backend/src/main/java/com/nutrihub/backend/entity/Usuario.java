package com.nutrihub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.nutrihub.backend.enums.Sexo_biologico;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.enums.Status_usuarios;

@Entity 
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

    public Usuario() {
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Sexo_biologico getSexo() {
        return sexo;
    }

    public void setSexo(Sexo_biologico sexo) {
        this.sexo = sexo;
    }

    public Tipo_usuarios getTipo() {
        return tipo;
    }

    public void setTipo(Tipo_usuarios tipo) {
        this.tipo = tipo;
    }

    public Status_usuarios getStatus() {
        return status;
    }

    public void setStatus(Status_usuarios status) {
        this.status = status;
    }

    public Boolean getSoftdelete() {
        return this.softdelete;
    }

    public void setSoftdelete(Boolean softdelete) {
        this.softdelete = softdelete;
    }

    public Integer getQtSenha(){
        return qtSenha;
    }

    public void setQtSenha(Integer qtSenha){
        this.qtSenha = qtSenha;
    }

    public Boolean getEmailVerificado() {
        return this.emailVerificado;
    }

    public void setEmailVerificado(Boolean emailVerificado) {
        this.emailVerificado = emailVerificado;
    }
}