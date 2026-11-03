package com.nutrihub.backend.entity;

import com.nutrihub.backend.enums.Categoria_alimentos;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
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

    public Categoria_alimentos getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria_alimentos categoria) {
        this.categoria = categoria;
    }

    public Integer getCalorias() {
        return calorias;
    }

    public void setCalorias(Integer calorias) {
        this.calorias = calorias;
    }

    public BigDecimal getProteina() {
        return proteina;
    }

    public void setProteina(BigDecimal proteina) {
        this.proteina = proteina;
    }

    public BigDecimal getCarboidratos() {
        return carboidratos;
    }

    public void setCarboidratos(BigDecimal carboidratos) {
        this.carboidratos = carboidratos;
    }

    public BigDecimal getGorduras() {
        return gorduras;
    }

    public void setGorduras(BigDecimal gorduras) {
        this.gorduras = gorduras;
    }
}