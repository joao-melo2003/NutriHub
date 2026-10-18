package com.nutrihub.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.http.Cookie;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.config.Customizer;

import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
public class SecurityConfig {

    
    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

        return request -> {
            String token = headerResolver.resolve(request);

            if (token != null) {
                return token;
            }

            Cookie[] cookies = request.getCookies();

            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("accessToken".equals(cookie.getName())) {
                        return cookie.getValue();
                    }
                }
            }

            return null;
        };
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(
                    CookieCsrfTokenRepository.withHttpOnlyFalse()
                )
                .csrfTokenRequestHandler(
                    new SpaCsrfTokenRequestHandler()
                )
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    HttpMethod.GET, "/api/auth/csrf"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST, "/api/auth/logout"
                ).authenticated()

                .requestMatchers(
                    HttpMethod.POST, "/api/auth/login"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST, "/api/usuarios"
                ).permitAll()

                .anyRequest().authenticated()
            )   
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .oauth2ResourceServer(oauth2 -> oauth2
                .bearerTokenResolver(bearerTokenResolver())
                .jwt(jwt -> {})
            );

        return http.build();
    }
}