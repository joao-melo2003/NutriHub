package com.nutrihub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nutrihub.backend.entity.RestricoesAlimentares;

public interface RestricaoAlimentarRepository
        extends JpaRepository<RestricoesAlimentares, String> {

    @Modifying(flushAutomatically = true)
    @Query("""
        DELETE FROM RestricoesAlimentares r
        WHERE r.usuario.cpf = :cpf
    """)
    void deleteByUsuarioCpf(@Param("cpf") String cpf);

    List<RestricoesAlimentares> findAllByUsuarioCpf(String cpf);
}