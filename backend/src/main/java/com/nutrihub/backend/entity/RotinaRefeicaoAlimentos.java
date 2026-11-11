package com.nutrihub.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "rotina_refeicao_alimentos")
public class RotinaRefeicaoAlimentos {

    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refeicao_id", referencedColumnName = "id", nullable = false)
    private RotinaRefeicoes refeicao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alimento_id", referencedColumnName = "id", nullable = false)
    private Alimento alimento;

    @Column(name = "quantidade", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantidade;
}