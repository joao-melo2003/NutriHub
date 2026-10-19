package com.nutrihub.backend.dto;

import org.springframework.data.domain.Page;

public record UsuariosPorStatusResponse(
    Page<UsuarioResponse> usuarios_ativos,
    Page<UsuarioResponse> usuarios_banidos,
    Page<UsuarioResponse> usuarios_desativados
) {}