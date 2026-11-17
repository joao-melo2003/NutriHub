package com.nutrihub.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nutrihub.backend.entity.UserToken;
import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.enums.Status_usuarios;
import com.nutrihub.backend.enums.Tipo_token;
import com.nutrihub.backend.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class EmailVerificacaoService {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    public EmailVerificacaoService(
            TokenService tokenService,
            UsuarioRepository usuarioRepository,
            EmailService emailService) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void criarEEnviar(Usuario usuario) {

        String token = tokenService.criarToken(
                usuario,
                Tipo_token.EMAIL_VERIFICATION,
                Duration.ofHours(24));

        emailService.enviarEmailVerificacao(usuario, token);
    }

    @Transactional
    public boolean confirmarEmail(String token) {

        UserToken verificacao = tokenService.buscarToken(
                token,
                Tipo_token.EMAIL_VERIFICATION);

        if (verificacao.getUsedAt() != null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Este token já foi utilizado");
        }

        Usuario usuario = verificacao.getUsuario();

        if (!verificacao.getExpiresAt().isAfter(LocalDateTime.now())) {

            tokenService.excluirTokenExpiradoEmail(verificacao);

            if (!Boolean.TRUE.equals(usuario.getEmailVerificado())) {
                usuarioRepository.delete(usuario);
            }

            return false;
        }

        usuario.setEmailVerificado(true);
        usuario.setStatus(Status_usuarios.ATIVO);

        usuarioRepository.save(usuario);

        tokenService.marcarComoUtilizado(verificacao);

        return true;
    }
}