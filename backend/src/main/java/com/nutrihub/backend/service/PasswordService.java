package com.nutrihub.backend.service;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nutrihub.backend.entity.UserToken;
import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.enums.Tipo_token;
import com.nutrihub.backend.enums.Status_usuarios;
import com.nutrihub.backend.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class PasswordService {

    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;

    public PasswordService(TokenService tokenService,EmailService emailService,PasswordEncoder passwordEncoder,UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void enviarEmailRecuperacao(Usuario usuario) {

        String token = tokenService.criarToken(usuario,Tipo_token.PASSWORD_RESET, Duration.ofHours(1));

        emailService.enviarEmailRecuperacaoSenha(usuario,token);
    }

    @Transactional
    public void redefinirSenha(String token, String novaSenha) {

        UserToken userToken = tokenService.buscarTokenValido(token, Tipo_token.PASSWORD_RESET);

        Usuario usuario = userToken.getUsuario();

        if (usuario.getStatus() != Status_usuarios.ATIVO || !Boolean.TRUE.equals(usuario.getEmailVerificado())) {
            
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Conta não autorizada para recuperação de senha");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));

        usuarioRepository.save(usuario);

        tokenService.marcarComoUtilizado(userToken);
    }
}