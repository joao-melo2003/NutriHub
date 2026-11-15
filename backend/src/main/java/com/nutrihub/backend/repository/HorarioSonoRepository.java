package com.nutrihub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nutrihub.backend.entity.HorariosSono;

public interface HorarioSonoRepository extends JpaRepository<HorariosSono, String> {

    boolean existsByRotinaId(String idRotina);
    List<HorariosSono> findAllByRotinaId(String idRotina);

    void deleteByRotinaId(String idRotina);
}