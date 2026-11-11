package com.nutrihub.backend.entity;

import com.nutrihub.backend.enums.Categoria_alimentos;
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

import java.math.BigDecimal;
import java.util.List;

@Entity
@Getter 
@Setter
@Table(name = "alimentos")
public class Alimento {

    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    @Column(name = "nome", nullable = false, length = 255)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false)
    private Categoria_alimentos categoria;

    @Column(name = "calorias", nullable = false)
    private Integer calorias;

    @Column(name = "proteina", nullable = false, precision = 6, scale = 2)
    private BigDecimal proteina;

    @Column(name = "carboidratos", nullable = false, precision = 6, scale = 2)
    private BigDecimal carboidratos;

    @Column(name = "gorduras", nullable = false, precision = 6, scale = 2)
    private BigDecimal gorduras;

    @OneToMany(mappedBy = "alimento", cascade = CascadeType.ALL)
    private List<PreferenciasAlimentares> preferenciasAlimentares;

    @OneToMany(mappedBy = "alimento", cascade = CascadeType.ALL)
    private List<RotinaRefeicaoAlimentos> rotinaRefeicaoAlimentos;
}