package com.nutrihub.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.nutrihub.backend.entity.Rotinas;

public interface RotinaRepository extends JpaRepository<Rotinas, String> {

    Optional<Rotinas> findByIdAndUsuarioCpf(String id, String cpf);

    Optional<Rotinas> findByUsuarioCpf(String cpf);

    @Query("SELECT r.id FROM Rotinas r WHERE r.usuario.cpf = :cpf")
    Optional<String> findIdByUsuarioCpf(@Param("cpf") String cpf);
}