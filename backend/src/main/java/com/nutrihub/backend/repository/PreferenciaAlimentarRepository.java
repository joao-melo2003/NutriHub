package com.nutrihub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nutrihub.backend.entity.PreferenciasAlimentares;

public interface PreferenciaAlimentarRepository extends JpaRepository<PreferenciasAlimentares, String> {

    @Modifying(flushAutomatically = true)
    @Query("""
        DELETE FROM PreferenciasAlimentares p
        WHERE p.usuario.cpf = :cpf
    """)
    void deleteByUsuarioCpf(@Param("cpf") String cpf);
    List<PreferenciasAlimentares> findAllByUsuarioCpf(String cpf);
}