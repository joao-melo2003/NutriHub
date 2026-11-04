package com.nutrihub.backend.entity;

import com.nutrihub.backend.enums.Tipo_restricoes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table(name = "restricoes")
public class Restricao {

    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private Tipo_restricoes tipo;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Tipo_restricoes getTipo() {
        return tipo;
    }

    public void setTipo(Tipo_restricoes tipo) {
        this.tipo = tipo;
    }
}
