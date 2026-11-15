package com.nutrihub.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nutrihub.backend.dto.*;
import com.nutrihub.backend.service.RotinaService;

import jakarta.validation.Valid;

@RestController
public class RotinaUpdateController {

    private final RotinaService rotinaService;

    public RotinaUpdateController(RotinaService rotinaService) {
        this.rotinaService = rotinaService;
    }

    @GetMapping("/RotinaUpdateForms1")
    public ResponseEntity<RotinaUpdateForms1Response> buscarForms1(Authentication authentication) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(
            rotinaService.buscarForms1(cpf)
        );
    }

    @PutMapping("/RotinaUpdateForms1")
    public ResponseEntity<Void> atualizarForms1(Authentication authentication,@Valid @RequestBody RotinaUpdateForms1Request request) {

        String cpf = authentication.getName();

        rotinaService.atualizarForms1(request, cpf);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/RotinaUpdateForms2")
    public ResponseEntity<RotinaUpdateForms2Response> buscarForms2(Authentication authentication) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(
            rotinaService.buscarForms2(cpf)
        );
    }

    @PutMapping("/RotinaUpdateForms2")
    public ResponseEntity<Void> atualizarForms2(Authentication authentication,@Valid @RequestBody RotinaUpdateForms2Request request) {

        String cpf = authentication.getName();

        rotinaService.atualizarForms2(request, cpf);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/RotinaUpdateForms3")
    public ResponseEntity<RotinaUpdateForms3Response> buscarForms3(Authentication authentication) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(
            rotinaService.buscarForms3(cpf)
        );
    }

    @PutMapping("/RotinaUpdateForms3")
    public ResponseEntity<Void> atualizarForms3(Authentication authentication,@Valid @RequestBody RotinaUpdateForms3Request request) {

        String cpf = authentication.getName();

        rotinaService.atualizarForms3(request, cpf);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/RotinaUpdateForms4")
    public ResponseEntity<RotinaUpdateForms4Response> buscarForms4(Authentication authentication) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(
            rotinaService.buscarForms4(cpf)
        );
    }

    @PutMapping("/RotinaUpdateForms4")
    public ResponseEntity<Void> atualizarForms4(Authentication authentication,@Valid @RequestBody RotinaUpdateForms4Request request) {

        String cpf = authentication.getName();

        rotinaService.atualizarForms4(request, cpf);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/RotinaUpdateForms5")
    public ResponseEntity<RotinaUpdateForms5Response> buscarForms5(Authentication authentication) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(
            rotinaService.buscarForms5(cpf)
        );
    }

    @PutMapping("/RotinaUpdateForms5")
    public ResponseEntity<Void> atualizarForms5(Authentication authentication,@Valid @RequestBody RotinaUpdateForms5Request request) {

        String cpf = authentication.getName();

        rotinaService.atualizarForms5(request, cpf);

        return ResponseEntity.ok().build();
    }
}