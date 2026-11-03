package com.nutrihub.backend.controller;

import com.nutrihub.backend.dto.ExcluirContaRequest;
import com.nutrihub.backend.dto.SenhaRequest;
import com.nutrihub.backend.dto.UsuarioRequest;
import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.dto.UsuarioUpdateRequest;
import com.nutrihub.backend.dto.UsuarioUpdateResponse;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.service.UsuarioService;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastro(@Valid @RequestBody UsuarioRequest request) {

        UsuarioResponse usuario = usuarioService.criarUsuarioComum(request);

        return ResponseEntity.created(URI.create("/api/usuarios/" + usuario.cpf())).body(usuario);
    }

    @PatchMapping("/update")
    public ResponseEntity<UsuarioUpdateResponse> atualizar(@Valid @RequestBody UsuarioUpdateRequest request,Authentication authentication) {

        String cpf = authentication.getName();

        UsuarioUpdateResponse usuario = usuarioService.atualizarUsuario(cpf, request);

        if (request.nome() != null && request.email() == null) {
            return ResponseEntity.ok(
                new UsuarioUpdateResponse(usuario.nome(), null)
            );

        } else if (request.nome() == null && request.email() != null) {
            return ResponseEntity.ok(
                new UsuarioUpdateResponse(null, usuario.email())
            );
        }

        return ResponseEntity.ok(usuario);
    }

    @PatchMapping("/updateSenha")
    public ResponseEntity<Void> mudarSenha(@Valid @RequestBody SenhaRequest request, Authentication authentication) {

        String cpf = authentication.getName();

        usuarioService.atualizarSenha(cpf, request);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> excluirConta(@Valid @RequestBody ExcluirContaRequest request, Authentication authentication, HttpServletResponse response) {

        String cpf = authentication.getName();

        usuarioService.excluirConta(cpf, request);

        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/infos")
    public ResponseEntity<UsuarioResponse> buscaInformacoes(Authentication authentication, @RequestParam(defaultValue = "") String infoUser){
        
        UsuarioResponse usuario = null;

        String cpf = authentication.getName();
        Tipo_usuarios tipo = usuarioService.tipoResponse(cpf);

        if(tipo == Tipo_usuarios.ADMIN && !infoUser.isEmpty()){
            usuario = usuarioService.procurarInfos(infoUser);
        }else if(tipo == Tipo_usuarios.COMUM){
            usuario = usuarioService.procurarInfos(cpf);
        }else if (tipo == Tipo_usuarios.ADMIN && infoUser.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(usuario);
    }
}