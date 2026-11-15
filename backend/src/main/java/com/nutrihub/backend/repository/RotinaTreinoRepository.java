package com.nutrihub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nutrihub.backend.entity.RotinaTreinos;

public interface RotinaTreinoRepository extends JpaRepository<RotinaTreinos, String> {

    boolean existsByRotinaId(String idRotina);
    List<RotinaTreinos> findAllByRotinaId(String idRotina);

    void deleteByRotinaId(String idRotina);
}


