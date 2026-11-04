package com.nutrihub.backend.repository;

import com.nutrihub.backend.entity.Restricao;
import com.nutrihub.backend.enums.Tipo_restricoes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface RestricoesRepository extends JpaRepository<Restricao, String> {

    Optional<Restricao> findByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, String id);

    Page<Restricao> findByNomeStartingWithIgnoreCaseOrderByNomeAsc(String nome,Pageable pageable);

    Page<Restricao> findByTipo(Tipo_restricoes tipo, Pageable pageable);

    Page<Restricao> findByNomeStartingWithIgnoreCaseAndTipoOrderByNomeAsc(String nome,Tipo_restricoes tipo,Pageable pageable);
}