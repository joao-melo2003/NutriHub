
package com.nutrihub.backend.controller;

import com.nutrihub.backend.dto.LoginRequest;
import com.nutrihub.backend.dto.LoginResponse;
import com.nutrihub.backend.service.AuthService;
import org.springframework.security.web.csrf.CsrfToken;
import java.util.Map;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
    

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
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
}
