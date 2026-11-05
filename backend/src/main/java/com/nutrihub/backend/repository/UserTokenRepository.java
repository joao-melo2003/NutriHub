package com.nutrihub.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nutrihub.backend.entity.UserToken;
import com.nutrihub.backend.enums.Tipo_token;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    Optional<UserToken> findByTokenHashAndTipo(
        String tokenHash,
        Tipo_token tipo
    );

    boolean existsByUsuarioCpfAndTipoAndExpiresAtAfterAndUsedAtIsNull(
        String cpf,
        Tipo_token tipo,
        LocalDateTime agora
    );

    @Modifying
    @Query("""
        DELETE FROM UserToken t
        WHERE t.usuario.cpf = :cpf
          AND t.tipo = :tipo
          AND t.expiresAt < :agora
          AND t.usedAt IS NULL
    """)
    int excluirTokensExpiradosENaoUtilizados(
        @Param("cpf") String cpf,
        @Param("tipo") Tipo_token tipo,
        @Param("agora") LocalDateTime agora
    );
}