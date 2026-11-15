package com.nutrihub.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nutrihub.backend.dto.*;
import com.nutrihub.backend.service.RotinaService;

import jakarta.validation.Valid;

@RestController
public class RotinaFormsController {

    private final RotinaService rotinaService;

    public RotinaFormsController(
            RotinaService rotinaFormsService) {
        this.rotinaService = rotinaFormsService;
    }

    @PostMapping("/RotinaForms1")
    public ResponseEntity<Map<String, String>> rotinaForms1( Authentication authentication, @Valid @RequestBody RotinaRequest request) {

        String cpf = authentication.getName();

        String idRotina = rotinaService.criarRotina(request, cpf);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("idRotina", idRotina));
    }

    @PostMapping("/RotinaForms2")
    public ResponseEntity<Void> rotinaForms2( Authentication authentication, @Valid @RequestBody RotinaTreinoRequest request) {

        String cpf = authentication.getName();

        rotinaService.criarTreinos(request, cpf);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/RotinaForms3")
    public ResponseEntity<Void> rotinaForms3(Authentication authentication,@Valid @RequestBody HorarioSonoRequest request) {

        String cpf = authentication.getName();

        rotinaService.criarHorariosSono(request, cpf);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/RotinaForms4")
    public ResponseEntity<Void> rotinaForms4( Authentication authentication, @Valid @RequestBody RestricoesAlimentaresRequest request) {

        String cpf = authentication.getName();

        rotinaService.salvarRestricoes(request, cpf);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/RotinaForms5")
    public ResponseEntity<Void> rotinaForms5( Authentication authentication, @Valid @RequestBody AlimentosPreferidosRequest request) {

        String cpf = authentication.getName();

        rotinaService.salvarAlimentosPreferidos(request, cpf);

        return ResponseEntity.ok().build();
    }

}