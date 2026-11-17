package com.nutrihub.backend.controller;

import com.nutrihub.backend.dto.ExcluirContaRequest;
import com.nutrihub.backend.dto.RotinaResposeUsuario;
import com.nutrihub.backend.dto.RotinaUsuarioResultado;
import com.nutrihub.backend.dto.SenhaRequest;
import com.nutrihub.backend.dto.UsuarioRequest;
import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.dto.UsuarioUpdateRequest;
import com.nutrihub.backend.dto.UsuarioUpdateResponse;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.service.RotinaService;
import com.nutrihub.backend.service.UsuarioService;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final RotinaService rotinaService;
    

    public UsuarioController(UsuarioService usuarioService, RotinaService rotinaFormsService) {
        this.usuarioService = usuarioService;
        this.rotinaService = rotinaFormsService;
    }

    @GetMapping("/sessao")
    public ResponseEntity<Void> verificarSessao(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
        
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/cadastrar")
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

    @GetMapping("/AddRotinaUsuario")
    public ResponseEntity<?> rotinaUsuario(Authentication authentication) {

        String cpf = authentication.getName();

        RotinaUsuarioResultado resultado = rotinaService.verificarRotinaUsuario(cpf);

        if("usuario sem rotina".equals(resultado.mensagem())) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of(
                    "message", "usuario sem rotina",
                    "error", 404
                )
            );
        }

        if("rotina corrompida".equals(resultado.mensagem())) {

            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of(
                    "message", "rotina corrompida",
                    "error", 409
                )
            );
        }

        return ResponseEntity.ok(resultado.rotina());
    }

   @PostMapping("/finalizaRotina")
    public ResponseEntity<Void> finalizaRotina(Authentication authentication) {
        String cpf = authentication.getName();

        RotinaResposeUsuario response = rotinaService.gerarRotinaDemonstracao(cpf);
        rotinaService.salvarRotinaGerada(cpf, response);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/DeletaRotinaUsuario")
    public ResponseEntity<Void> excluirRotina(Authentication authentication,@RequestParam boolean confirmar) {

        String cpf = authentication.getName();

        rotinaService.excluirRotina(cpf, confirmar);

        return ResponseEntity.noContent().build();
    }
}