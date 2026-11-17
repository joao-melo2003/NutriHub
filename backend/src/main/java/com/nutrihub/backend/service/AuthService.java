package com.nutrihub.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import com.nutrihub.backend.dto.LoginRequest;
import com.nutrihub.backend.dto.LoginResponse;
import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.repository.UsuarioRepository;
import com.nutrihub.backend.enums.Status_usuarios;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder){
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }
    
    public LoginResponse login(LoginRequest request) {

        Usuario usuario = usuarioRepository
        .findByEmail(request.email())
        .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos"));

        if(!usuario.getEmailVerificado()){
            throw new BadCredentialsException("Verifique o email enviado para completar o login");
        }

        if (!passwordEncoder.matches(
            request.senha(), usuario.getSenha())) {
            throw new BadCredentialsException("E-mail ou senha inválidos");
        }

        if (usuario.getStatus() != Status_usuarios.ATIVO || Boolean.TRUE.equals(usuario.getSoftdelete())) {
            throw new BadCredentialsException("Conta indisponível");
        }

        Instant agora = Instant.now();
        Instant expiracao = agora.plus(3, ChronoUnit.DAYS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer("nutrihub")
        .subject(usuario.getCpf())
        .issuedAt(agora)
        .expiresAt(expiracao)
        .claim("email", usuario.getEmail())
        .claim("role", usuario.getTipo().name())
        .build();

        String token = jwtEncoder
        .encode(JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader
                .with(MacAlgorithm.HS256)
                .build(),
        claims))
        .getTokenValue();

        usuario.setQtSenha(request.senha().length());

        return new LoginResponse(token, "Bearer", expiracao);
    }
 
}