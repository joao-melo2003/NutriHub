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

@Entity
@Getter
@Setter
@Table(name = "horarios_sono")
public class HorariosSono {

    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rotina_id", referencedColumnName = "id", nullable = false)
    private Rotinas rotina;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private Dia_semana diaSemana;

    @Column(name = "horario_dormir", nullable = false)
    private LocalTime horarioDormir;

    @Column(name = "horario_acordar", nullable = false)
    private LocalTime horarioAcordar;
}