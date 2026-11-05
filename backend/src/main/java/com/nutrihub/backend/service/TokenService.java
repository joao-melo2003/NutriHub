package com.nutrihub.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nutrihub.backend.entity.UserToken;
import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.enums.Tipo_token;
import com.nutrihub.backend.repository.UserTokenRepository;

import jakarta.transaction.Transactional;

@Service
public class TokenService {

    private final UserTokenRepository tokenRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public TokenService(UserTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    private String gerarToken() {

        byte[] bytes = new byte[32];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String gerarHash(String token) {

        try {

            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "Erro ao gerar hash do token", e
            );
        }
    }

    @Transactional
    public String criarToken(Usuario usuario,Tipo_token tipo,Duration validade){

        LocalDateTime agora = LocalDateTime.now();

        if (tipo == Tipo_token.EMAIL_VERIFICATION) {

            tokenRepository.excluirTokensExpiradosENaoUtilizados(usuario.getCpf(),Tipo_token.EMAIL_VERIFICATION,agora);
        }

        String token = gerarToken();

        UserToken userToken = new UserToken();

        userToken.setUsuario(usuario);
        userToken.setTipo(tipo);
        userToken.setTokenHash(gerarHash(token));
        userToken.setExpiresAt(agora.plus(validade));

        tokenRepository.save(userToken);

        return token;
    }

    public UserToken buscarTokenValido(String token,Tipo_token tipo) {

        String hash = gerarHash(token);

        UserToken userToken = tokenRepository
                .findByTokenHashAndTipo(hash, tipo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Token inválido"
                ));

        if (userToken.getUsedAt() != null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Este token já foi utilizado"
            );
        }

        if (!userToken.getExpiresAt().isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Token expirado"
            );
        }

        return userToken;
    }

    public UserToken buscarToken(String token, Tipo_token tipo) {

        String hash = gerarHash(token);

        return tokenRepository
                .findByTokenHashAndTipo(hash, tipo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Token inválido"
                ));
    }

    public void marcarComoUtilizado(UserToken token) {

        token.setUsedAt(LocalDateTime.now());

        tokenRepository.save(token);
    }

    @Transactional
    public void excluirTokenExpiradoEmail(UserToken userToken) {

        if (userToken.getTipo() != Tipo_token.EMAIL_VERIFICATION) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de token inválido para exclusão"
            );
        }

        if (userToken.getUsedAt() != null ||
                userToken.getExpiresAt().isAfter(LocalDateTime.now())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Token não pode ser excluído"
            );
        }

        tokenRepository.delete(userToken);
    }

    public Usuario buscarUsuarioPorToken(String token,Tipo_token tipo){

        String hash = gerarHash(token);

        UserToken userToken = tokenRepository
                .findByTokenHashAndTipo(hash, tipo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Token inválido"
                ));

        return userToken.getUsuario();
    }
}