package com.nutrihub.backend.controller;

import com.nutrihub.backend.dto.BanirRequest;
import com.nutrihub.backend.dto.LoginRequest;
import com.nutrihub.backend.dto.LoginResponse;
import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.dto.UsuariosPorStatusResponse;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.repository.UsuarioRepository;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    /*
     * ?paginaAtivos=1&paginaBanidos=1
     * 
     * page 0 é a primeira página
     */
    @GetMapping("/index")
    public ResponseEntity<UsuariosPorStatusResponse> buscaUsuarios(Authentication authentication,
            @RequestParam(defaultValue = "0") int paginaAtivos,
            @RequestParam(defaultValue = "0") int paginaBanidos,
            @RequestParam(defaultValue = "0") int paginaDesativados) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(usuarioService.tipoUsuario(cpf, paginaAtivos, paginaBanidos, paginaDesativados));
    }

    @GetMapping("/filtraNomes")
    public ResponseEntity<Page<UsuarioResponse>> filtraNomes(Authentication authentication,
            @RequestParam String nome,
            @RequestParam(defaultValue = "0") int pagina) {

        String cpf = authentication.getName();

        Page<UsuarioResponse> usuarios = usuarioService.filtroNomeUsuarios(nome, cpf, pagina);

        return ResponseEntity.ok(usuarios);
    }

    @PostMapping("/banir")
    public ResponseEntity<Void> banirConta(Authentication authentication, @RequestBody BanirRequest request) {

        String cpfAdmin = authentication.getName();
        Tipo_usuarios tipo = usuarioService.tipoResponse(cpfAdmin);

        System.err.println(tipo + " aaaaaaaaa");

        if (tipo.equals(Tipo_usuarios.ADMIN)) {
            usuarioService.banirUsuario(request.cpfUser());
            return ResponseEntity.ok().build();
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Apenas administradores podem banir contas.");
    }

}
