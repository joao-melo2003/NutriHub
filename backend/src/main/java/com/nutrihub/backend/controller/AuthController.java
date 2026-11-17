
package com.nutrihub.backend.controller;

import com.nutrihub.backend.dto.ConfirmarEmailRequest;
import com.nutrihub.backend.dto.LoginRequest;
import com.nutrihub.backend.dto.LoginResponse;
import com.nutrihub.backend.dto.RecuperarSenhaRequest;
import com.nutrihub.backend.dto.RedefinirSenhaRequest;
import com.nutrihub.backend.repository.UsuarioRepository;
import com.nutrihub.backend.service.AuthService;
import com.nutrihub.backend.service.EmailVerificacaoService;
import com.nutrihub.backend.service.PasswordService;
import com.nutrihub.backend.service.TokenService;
import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.enums.Tipo_token;
import com.nutrihub.backend.service.UsuarioService;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;
    private final EmailVerificacaoService emailVerificacaoService;
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordService passwordService;
    private final TokenService tokenService;

    public AuthController(AuthService authService, EmailVerificacaoService emailVerificacaoService, UsuarioRepository usuarioRepository, UsuarioService usuarioService, PasswordService passwordService, TokenService tokenService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.emailVerificacaoService = emailVerificacaoService;
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        LoginResponse login = authService.login(request);

        ResponseCookie cookie = ResponseCookie
                .from("accessToken", login.accessToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(3))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                    "message", "Login realizado com sucesso",
                    "expiresAt", login.expiresAt()
                ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
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


    @PostMapping("/email/confirmar")
    public ResponseEntity<?> confirmarEmail(@Valid @RequestBody ConfirmarEmailRequest request){

        boolean confirmado = emailVerificacaoService.confirmarEmail(request.token());

        if (!confirmado) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("message", "Token de confirmação expirado."));
        }
        return ResponseEntity.ok(Map.of("message", "E-mail confirmado com sucesso!"));
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<?> solicitarRecuperacao(@Valid @RequestBody RecuperarSenhaRequest request){

        Usuario user = usuarioRepository.findByEmail(request.email()).orElse(null);

        if(user == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email não foi encontrado.");
        }

        usuarioService.solicitarRecuperacaoSenha(user.getCpf(),request.email());

        return ResponseEntity.ok(Map.of("message","E-mail de recuperação enviado com sucesso.")
        );
    }

    @PostMapping("/password/reset")
    public ResponseEntity<?> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {

        if(!request.novaSenha().equals(request.novaSenhaConfirm())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As senhas precisam coincidir!");
        }

        Usuario usuario = tokenService.buscarUsuarioPorToken(request.token(),Tipo_token.PASSWORD_RESET);

        if(passwordEncoder.matches(
            request.novaSenha(), usuario.getSenha())) {
            throw new BadCredentialsException("A senha não pode ser igual a anterior!");
        }

        passwordService.redefinirSenha(request.token(),request.novaSenha());

        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso!"));
    }
}
