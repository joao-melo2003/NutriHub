package com.nutrihub.backend.controller;

import com.nutrihub.backend.dto.AlimentoResponse;
import com.nutrihub.backend.dto.AlimentosRequest;
import com.nutrihub.backend.dto.AlimentosUpdateRequest;
import com.nutrihub.backend.dto.BanirRequest;
import com.nutrihub.backend.dto.LoginRequest;
import com.nutrihub.backend.dto.LoginResponse;
import com.nutrihub.backend.dto.RestricaoRequest;
import com.nutrihub.backend.dto.RestricaoResponse;
import com.nutrihub.backend.dto.RestricaoUpdateRequest;
import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.dto.UsuariosPorStatusResponse;
import com.nutrihub.backend.enums.Tipo_restricoes;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.repository.UsuarioRepository;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.service.AuthService;
import com.nutrihub.backend.service.UsuarioService;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UsuarioService usuarioService;

    public AdminController(UsuarioService usuarioService, UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
    }

    private void verificaAdmin(Authentication authentication) {

        String cpf = authentication.getName();
        Tipo_usuarios tipo = usuarioService.tipoResponse(cpf);

        if (!tipo.equals(Tipo_usuarios.ADMIN)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Apenas administradores podem realizar essa operação"
            );
        }
    }

    /*
     * ?paginaAtivos=1&paginaBanidos=1
     * 
     * page 0 é a primeira página
     */
    @GetMapping("/indexUsuarios")
    public ResponseEntity<UsuariosPorStatusResponse> buscaUsuarios(Authentication authentication,
            @RequestParam(defaultValue = "0") int paginaAtivos,
            @RequestParam(defaultValue = "0") int paginaBanidos,
            @RequestParam(defaultValue = "0") int paginaDesativados) {

        String cpf = authentication.getName();

        return ResponseEntity.ok(usuarioService.tipoUsuario(cpf, paginaAtivos, paginaBanidos, paginaDesativados));
    }

    @GetMapping("/filtraNomes")
    public ResponseEntity<Page<UsuarioResponse>> filtraNomes(Authentication authentication,@RequestParam String nome,@RequestParam(defaultValue = "0") int pagina) {

        String cpf = authentication.getName();

        Page<UsuarioResponse> usuarios = usuarioService.filtroNomeUsuarios(nome, cpf, pagina);

        return ResponseEntity.ok(usuarios);
    }

    @PostMapping("/banir")
    public ResponseEntity<Void> banirConta(Authentication authentication, @RequestBody BanirRequest request) {

        String cpfAdmin = authentication.getName();
        Tipo_usuarios tipo = usuarioService.tipoResponse(cpfAdmin);

        if(tipo.equals(Tipo_usuarios.ADMIN)) {
            usuarioService.banirUsuario(request.cpfUser());
            return ResponseEntity.ok().build();
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Apenas administradores podem banir contas.");
    }

    @PostMapping("/addAlimentos")
    public ResponseEntity<Void> adicionaAlimento(Authentication authentication, @RequestBody AlimentosRequest request) {

        String cpf = authentication.getName();
        Tipo_usuarios tipo = usuarioService.tipoResponse(cpf);

        if (tipo.equals(Tipo_usuarios.ADMIN)) {
            usuarioService.criaAlimento(request);
            return ResponseEntity.ok().build();
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Apenas administradores podem criar alimentos");
    }
    
    @GetMapping("/indexAlimento")
    public ResponseEntity<Page<AlimentoResponse>> indexAlimento(Authentication authentication, @RequestParam(defaultValue = "0") int pagina) {

        return ResponseEntity.ok(usuarioService.listaAlimentos(pagina));
    }

    @GetMapping("/infoAlimento/{id}")
    public ResponseEntity<AlimentoResponse> infoAlimento(@PathVariable String id) {

        return ResponseEntity.ok(usuarioService.infoAlimento(id));
    }

    @PatchMapping("/editarAlimento/{id}")
    public ResponseEntity<Void> editarAlimento(Authentication authentication, @PathVariable String id, @Valid @RequestBody AlimentosUpdateRequest request) {

        verificaAdmin(authentication);

        usuarioService.editarAlimento(id, request);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deletarAlimento/{id}")
    public ResponseEntity<Void> deletarAlimento(Authentication authentication,@PathVariable String id) {

        verificaAdmin(authentication);

        usuarioService.deletarAlimento(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscaAlimentoNome")
    public ResponseEntity<List<AlimentoResponse>> buscaAlimentoNome(@RequestParam String nome) {

        return ResponseEntity.ok(usuarioService.buscaAlimentoNome(nome));
    }

    @PostMapping("/addRestricao")
    public ResponseEntity<Void> adicionaRestricao(Authentication authentication, @Valid @RequestBody RestricaoRequest request) {

        verificaAdmin(authentication);

        usuarioService.criaRestricao(request);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/indexRestricao")
    public ResponseEntity<Page<RestricaoResponse>> indexRestricao(Authentication authentication, @RequestParam(defaultValue = "0") int pagina) {

        return ResponseEntity.ok(usuarioService.listaRestricoes(pagina));
    }

    @GetMapping("/infoRestricao/{id}")
    public ResponseEntity<RestricaoResponse> infoRestricao(
            @PathVariable String id) {

        return ResponseEntity.ok(usuarioService.infoRestricao(id));
    }

    @PatchMapping("/editarRestricao/{id}")
    public ResponseEntity<Void> editarRestricao(Authentication authentication,@PathVariable String id, @Valid @RequestBody RestricaoUpdateRequest request) {

        verificaAdmin(authentication);

        usuarioService.editarRestricao(id, request);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deletarRestricao/{id}")
    public ResponseEntity<Void> deletarRestricao(Authentication authentication, @PathVariable String id) {

        verificaAdmin(authentication);

        usuarioService.deletarRestricao(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscaRestricao")
    public ResponseEntity<Page<RestricaoResponse>> buscaRestricao(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Tipo_restricoes tipo,
            @RequestParam(defaultValue = "0") int pagina) {

        return ResponseEntity.ok(
            usuarioService.buscaRestricao(nome, tipo, pagina)
        );
    }


}
