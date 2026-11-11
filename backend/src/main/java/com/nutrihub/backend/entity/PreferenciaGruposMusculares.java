package com.nutrihub.backend.entity;

import com.nutrihub.backend.enums.Grupo_treino;

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

@Entity
@Getter
@Setter
@Table(name = "preferencia_grupos_musculares")
public class PreferenciaGruposMusculares {

    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rotina_id", referencedColumnName = "id", nullable = false)
    private Rotinas rotina;

    @Enumerated(EnumType.STRING)
    @Column(name = "grupo", nullable = false)
    private Grupo_treino grupo;

    @Column(name = "prioridade", nullable = false)
    private Integer prioridade;
}