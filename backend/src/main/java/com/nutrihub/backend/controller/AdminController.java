package com.nutrihub.backend.controller;

import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.dto.UsuariosPorStatusResponse;
import com.nutrihub.backend.repository.UsuarioRepository;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;


import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.service.AuthService;
import com.nutrihub.backend.service.UsuarioService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UsuarioService usuarioService;

    public AdminController(UsuarioService usuarioService, UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
    }

    /* ?paginaAtivos=1&paginaBanidos=1 */
    @GetMapping("/index")
    public ResponseEntity<UsuariosPorStatusResponse> buscaUsuarios( Authentication authentication,
    @RequestParam(defaultValue = "0") int paginaAtivos,
    @RequestParam(defaultValue = "0") int paginaBanidos,
    @RequestParam(defaultValue = "0") int paginaDesativados) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(usuarioService.tipoUsuario(cpf,paginaAtivos,paginaBanidos,paginaDesativados));
    }
}
