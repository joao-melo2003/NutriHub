package com.nutrihub.backend.service;

import com.nutrihub.backend.dto.ExcluirContaRequest;
import com.nutrihub.backend.dto.SenhaRequest;
import com.nutrihub.backend.dto.UsuarioRequest;
import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.dto.UsuarioUpdateRequest;
import com.nutrihub.backend.dto.UsuarioUpdateResponse;
import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.enums.Status_usuarios;
import com.nutrihub.backend.repository.UsuarioRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;


@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private static final Pattern NOME_VALIDO = Pattern.compile("^[\\p{L}\\p{M}]+(?:[ '\\u2019-][\\p{L}\\p{M}]+)*$");

    private static final Pattern EMAIL_VALIDO = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", Pattern.CASE_INSENSITIVE);

    String SENHA_VALIDA = "^(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$";

    private static final Set<String> DOMINIOS_PERMITIDOS = Set.of(
        "gmail.com",
        "googlemail.com",
        "hotmail.com",
        "hotmail.com.br",
        "outlook.com",
        "outlook.com.br",
        "live.com",
        "live.com.br",
        "msn.com",
        "yahoo.com",
        "yahoo.com.br",
        "icloud.com",
        "proton.me",
        "protonmail.com"
    );

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public UsuarioResponse criarUsuarioComum(UsuarioRequest request) {

        if(usuarioRepository.existsByCpf(request.cpf())) {
            Usuario usuario = usuarioRepository.findByCpf(request.cpf()).orElse(null);

            if(usuario.getStatus() == Status_usuarios.DESATIVADO || usuario.getSoftdelete()){
                throw new ResponseStatusException(HttpStatus.CONFLICT,"CPF pertence a uma conta DESATIVADA");

            }else if(usuario.getStatus() == Status_usuarios.BANIDO){
                throw new ResponseStatusException(HttpStatus.CONFLICT,"CPF pertence a uma conta BANIDA pelo sistema");
            }

            throw new ResponseStatusException(HttpStatus.CONFLICT,"CPF já cadastrado");
        }

        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"E-mail já cadastrado");
        }

        if (!request.senha().equals(request.senhaConfirm())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Senhas não são iguais");
        }

        if (request.senha() == null || !Pattern.matches(SENHA_VALIDA, request.senha())){
            throw new ResponseStatusException( 
                HttpStatus.BAD_REQUEST, 
                "A senha deve conter pelo menos 1 letra maiúscula, 1 número, 1 símbolo e atender ao tamanho mínimo (8 caractere)."
            );
        }

        Usuario usuario = new Usuario();

        usuario.setCpf(request.cpf());
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setDataNascimento(request.dataNascimento());
        usuario.setSexo(request.sexo());

    
        usuario.setTipo(Tipo_usuarios.COMUM);
        usuario.setStatus(Status_usuarios.ATIVO);
        usuario.setSoftdelete(false);

        Usuario salvo = usuarioRepository.save(usuario);

        return new UsuarioResponse(
            salvo.getCpf(),
            salvo.getNome(),
            salvo.getEmail(),
            salvo.getDataNascimento(),
            salvo.getSexo(),
            salvo.getTipo(),
            salvo.getStatus()
        );
    }

    public UsuarioUpdateResponse atualizarUsuario(String cpf, UsuarioUpdateRequest request) {

        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado"
            ));

        if (request.nome() != null) {
            String nome = request.nome().strip();

            if (nome.isEmpty()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nome não pode ser vazio"
                );
            }

            if (!NOME_VALIDO.matcher(nome).matches()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nome deve conter somente letras, espaços, apóstrofos ou hífens"
                );
            }

            usuario.setNome(nome);
        }

        if (request.email() != null) {
            String email = request.email().strip();

            if (email.isEmpty()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "E-mail não pode ser vazio"
                );
            }

            if (!EMAIL_VALIDO.matcher(email).matches()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Formato de e-mail inválido"
                );
            }

            String dominio = email.substring(email.lastIndexOf('@') + 1)
                .toLowerCase(Locale.ROOT);

            if (!DOMINIOS_PERMITIDOS.contains(dominio)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Utilize um provedor de e-mail permitido, como Gmail, Hotmail ou Outlook"
                );
            }

            var usuarioEmail = usuarioRepository.findByEmail(email);

            if (usuarioEmail.isPresent()
                    && !usuarioEmail.get().getCpf().equals(cpf)) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "E-mail já cadastrado"
                );
            }

            usuario.setEmail(email);
        }

        Usuario atualizado = usuarioRepository.save(usuario);

        return new UsuarioUpdateResponse(
            atualizado.getNome(),
            atualizado.getEmail()
        );
    }

    public void atualizarSenha(String cpf, SenhaRequest request) {

        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado"
            ));
        if (!passwordEncoder.matches(
                request.senhaAntiga(),
                usuario.getSenha())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Senha atual incorreta"
            );
        }

        if (!Pattern.matches(SENHA_VALIDA, request.senha())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A senha deve conter pelo menos 1 letra maiúscula, 1 número, 1 símbolo e atender ao tamanho mínimo (8 caractere)."
            );
        }

        if (!request.senha().equals(request.senhaConfirm())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A confirmação da senha não corresponde à nova senha"
            );
        }

        if (passwordEncoder.matches(
                request.senha(),
                usuario.getSenha())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A nova senha deve ser diferente da senha atual"
            );
        }

        usuario.setSenha(passwordEncoder.encode(request.senha()));

        usuarioRepository.save(usuario);
    }

    public void excluirConta(String cpf, ExcluirContaRequest request) {
        if (!request.confirm()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "É necessário confirmar a exclusão da conta"
            );
        }

        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado"
            ));

        usuario.setSoftdelete(true);
        usuario.setStatus(Status_usuarios.DESATIVADO);

        usuarioRepository.save(usuario);
    }
}