package com.nutrihub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.nutrihub.backend.entity.RotinaRefeicaoAlimentos;

public interface RotinaRefeicaoAlimentosRepository extends JpaRepository<RotinaRefeicaoAlimentos, String> {

    List<RotinaRefeicaoAlimentos> findAllByRefeicao_Id(String idRefeicao);

    List<RotinaRefeicaoAlimentos> findAllByRefeicao_Rotina_Id(String idRotina);

    boolean existsByRefeicao_Id(String idRefeicao);

    @Modifying
    @Transactional
    @Query("""
                DELETE FROM RotinaRefeicaoAlimentos rra
                WHERE rra.refeicao.id = :idRefeicao
            """)
    void deleteByRefeicaoId(@Param("idRefeicao") String idRefeicao);

    @Modifying
    @Transactional
    @Query("""
                DELETE FROM RotinaRefeicaoAlimentos rra
                WHERE rra.refeicao.id IN :idsRefeicoes
            """)
    void deleteByRefeicaoIdIn(@Param("idsRefeicoes") List<String> idsRefeicoes);

    @Modifying
    @Transactional
    @Query("""
                DELETE FROM RotinaRefeicaoAlimentos rra
                WHERE rra.refeicao.rotina.usuario.cpf = :cpf
            """)
    void deleteByUsuarioCpf(@Param("cpf") String cpf);
}