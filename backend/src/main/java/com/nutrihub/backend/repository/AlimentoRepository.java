package com.nutrihub.backend.repository;

import com.nutrihub.backend.entity.Alimento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AlimentoRepository extends JpaRepository<Alimento, String> {

    boolean existsByNome(String nome);

    Optional<Alimento> findByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, String id);

    List<Alimento> findByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);
}