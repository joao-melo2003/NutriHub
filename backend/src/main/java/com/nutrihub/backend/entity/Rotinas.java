package com.nutrihub.backend.entity;

import java.math.BigDecimal;
import java.util.List;

import com.nutrihub.backend.enums.Distribuicao_rotina;
import com.nutrihub.backend.enums.Divisao_rotina;
import com.nutrihub.backend.enums.Objetivo_rotina;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Getter
@Setter 
@Table(name = "rotinas")
public class Rotinas {
    @Id 
    @Column(name = "id", length = 255, nullable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "CPF", unique = true)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "objetivo", nullable = false)
    private Objetivo_rotina objetivo;

    @Column(name = "peso", nullable = false, precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(name = "altura", nullable = false, precision = 4, scale = 2)
    private BigDecimal altura;

    @Enumerated(EnumType.STRING)
    @Column(name = "divisao",nullable = false)
    private Divisao_rotina divisao;

    @Enumerated(EnumType.STRING)
    @Column(name = "distribuicao", nullable = false)
    private Distribuicao_rotina distribuicao;

    @OneToMany(mappedBy = "rotina", cascade = CascadeType.ALL)
    private List<RotinaTreinos> rotinaTreinos;

    @OneToMany(mappedBy = "rotina", cascade = CascadeType.ALL)
    private List<HorariosSono> horariosSono;

    @OneToMany(mappedBy = "rotina", cascade = CascadeType.ALL)
    private List<PreferenciaGruposMusculares> preferenciasGruposMusculares;

    @OneToMany(mappedBy = "rotina", cascade = CascadeType.ALL)
    private List<RotinaRefeicoes> rotinaRefeicoes;

}
