package com.nutrihub.backend.repository;

import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.enums.Status_usuarios;
import com.nutrihub.backend.enums.Tipo_usuarios;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    Page<Usuario> findByTipoAndStatus(Tipo_usuarios tipo,Status_usuarios status,Pageable pageable);
}