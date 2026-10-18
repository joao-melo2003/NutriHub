
package com.nutrihub.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/teste")
public class Teste {

    @GetMapping("/getTeste")
    public ResponseEntity<String> teste() {
        System.out.println("Entrou");

        return ResponseEntity.ok("Token validado e rota acessada!");
    }
}
