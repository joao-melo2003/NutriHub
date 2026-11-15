package com.nutrihub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.nutrihub.backend.entity.RotinaRefeicoes;

public interface RotinaRefeicoesRepository extends JpaRepository<RotinaRefeicoes, String> {

    List<RotinaRefeicoes> findAllByRotina_Id(String idRotina);

    @Query("""
        SELECT rr.id
        FROM RotinaRefeicoes rr
        WHERE rr.rotina.id = :idRotina
    """)
    List<String> findIdsByRotinaId(@Param("idRotina") String idRotina);

    boolean existsByRotina_Id(String idRotina);

    @Modifying
    @Transactional
    @Query("""
        DELETE FROM RotinaRefeicoes rr
        WHERE rr.rotina.id = :idRotina
    """)
    void deleteByRotinaId(@Param("idRotina") String idRotina);
}