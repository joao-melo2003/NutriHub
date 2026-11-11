package com.nutrihub.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;

import com.nutrihub.backend.enums.Dia_semana;

@Entity
@Getter
@Setter
@Table(name = "rotina_refeicoes")
public class RotinaRefeicoes {

    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rotina_id", referencedColumnName = "id", nullable = false)
    private Rotinas rotina;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private Dia_semana diaSemana;

    @Column(name = "horario", nullable = false)
    private LocalTime horario;

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    @OneToMany(mappedBy = "refeicao", cascade = CascadeType.ALL)
    private List<RotinaRefeicaoAlimentos> rotinaRefeicaoAlimentos;
}