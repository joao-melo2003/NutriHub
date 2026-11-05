package com.nutrihub.backend.entity;

import java.util.List;

import com.nutrihub.backend.enums.Tipo_restricoes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter 
@Setter
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

    @OneToMany(mappedBy = "restricao", cascade = CascadeType.ALL)
    private List<RestricoesAlimentares> restricoesAlimentares;
}
