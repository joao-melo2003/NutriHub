package com.nutrihub.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

import com.nutrihub.backend.enums.Dia_semana;
import com.nutrihub.backend.enums.Grupo_treino;

@Entity
@Getter
@Setter
@Table(name = "rotina_treinos")
public class RotinaTreinos {

    @Id
    @Column(name = "id", length = 255, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rotina_id", referencedColumnName = "id", nullable = false)
    private Rotinas rotina;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private Dia_semana diaSemana;

    @Column(name = "horario_inicio", nullable = false)
    private LocalTime horarioInicio;

    @Column(name = "horario_fim", nullable = false)
    private LocalTime horarioFim;

    @Enumerated(EnumType.STRING)
    @Column(name = "grupo", nullable = false)
    private Grupo_treino grupo;
}