
package com.nutrihub.backend.exception;

import com.nutrihub.backend.dto.ApiErrorResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.security.authentication.BadCredentialsException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ApiErrorResponse> tratarErro(ResponseStatusException ex) {

                int status = ex.getStatusCode().value();

                ApiErrorResponse erro = new ApiErrorResponse(status, ex.getReason());

                return ResponseEntity.status(ex.getStatusCode()).body(erro);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> tratarValidacao(MethodArgumentNotValidException ex) {
                String mensagem = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .findFirst()
                                .map(erro -> erro.getDefaultMessage())
                                .orElse("Dados inválidos");

                ApiErrorResponse erro = new ApiErrorResponse(HttpStatus.BAD_REQUEST.value(), mensagem);

                return ResponseEntity.badRequest().body(erro);
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiErrorResponse> tratarCredenciaisInvalidas(BadCredentialsException ex) {

                ApiErrorResponse erro = new ApiErrorResponse(HttpStatus.UNAUTHORIZED.value(), ex.getMessage());

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro);
        }
}
