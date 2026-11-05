package com.nutrihub.backend.entity;

import com.nutrihub.backend.enums.Tipo_preferencias_alimentares;

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
@Table(name = "preferencias_alimentares")
public class PreferenciasAlimentares {
    
    @Id 
    @Column(name="id", length = 255, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", referencedColumnName = "CPF")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alimento_id", referencedColumnName = "id")
    private Alimento alimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferencia", nullable = false)
    private Tipo_preferencias_alimentares preferencia;
}
