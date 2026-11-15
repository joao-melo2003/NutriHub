package com.nutrihub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nutrihub.backend.entity.PreferenciaGruposMusculares;

public interface PreferenciaGrupoMuscularRepository extends JpaRepository<PreferenciaGruposMusculares, String> {
        List<PreferenciaGruposMusculares> findAllByRotinaId(String idRotina);

        void deleteByRotinaId(String idRotina);
}