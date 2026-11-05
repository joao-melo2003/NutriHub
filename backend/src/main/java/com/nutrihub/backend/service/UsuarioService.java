package com.nutrihub.backend.service;

import com.nutrihub.backend.dto.AlimentoResponse;
import com.nutrihub.backend.dto.AlimentosRequest;
import com.nutrihub.backend.dto.AlimentosUpdateRequest;
import com.nutrihub.backend.dto.ExcluirContaRequest;
import com.nutrihub.backend.dto.RestricaoRequest;
import com.nutrihub.backend.dto.RestricaoResponse;
import com.nutrihub.backend.dto.RestricaoUpdateRequest;
import com.nutrihub.backend.dto.SenhaRequest;
import com.nutrihub.backend.dto.UsuarioRequest;
import com.nutrihub.backend.dto.UsuarioResponse;
import com.nutrihub.backend.dto.UsuarioUpdateRequest;
import com.nutrihub.backend.dto.UsuarioUpdateResponse;
import com.nutrihub.backend.entity.Alimento;
import com.nutrihub.backend.entity.Restricao;
import com.nutrihub.backend.entity.Usuario;
import com.nutrihub.backend.enums.Tipo_usuarios;
import com.nutrihub.backend.enums.Status_usuarios;
import com.nutrihub.backend.enums.Tipo_restricoes;
import com.nutrihub.backend.repository.AlimentoRepository;
import com.nutrihub.backend.repository.RestricoesRepository;
import com.nutrihub.backend.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

import com.nutrihub.backend.dto.UsuariosPorStatusResponse;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.time.LocalDate;


@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AlimentoRepository alimentoRepository;
    private final RestricoesRepository restricoesRepository;
    private final EmailVerificacaoService emailVerificacaoService;
    private final PasswordService passwordService;
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

    public UsuarioService(UsuarioRepository usuarioRepository, AlimentoRepository alimentoRepository, RestricoesRepository restricoesRepository, EmailVerificacaoService emailVerificacaoService, PasswordService passwordService) {
        this.usuarioRepository = usuarioRepository;
        this.alimentoRepository = alimentoRepository;
        this.restricoesRepository = restricoesRepository;
        this.emailVerificacaoService = emailVerificacaoService;
        this.passwordService = passwordService;
    }


    public Tipo_usuarios tipoResponse(String CPF){
        Usuario usuario = usuarioRepository.findByCpf(CPF).orElseThrow(() -> new BadCredentialsException("Usuário sem autenticação"));

        return usuario.getTipo();
    }

    @Transactional
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

        if(!(request.dataNascimento().getYear() >= 1930 && request.dataNascimento().getYear() <= LocalDate.now().getYear() - 16)){
            if(LocalDate.now().getYear() <= 16 - request.dataNascimento().getYear()){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O usuário tem ser maior de 16 anos");
            }else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O usuário já esta fazendo hora extra na terra!");
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
        usuario.setQtSenha(request.senha().length());
        usuario.setEmailVerificado(false);

        Usuario salvo = usuarioRepository.save(usuario);

        emailVerificacaoService.criarEEnviar(salvo);

        return new UsuarioResponse(
            salvo.getCpf(),
            salvo.getNome(),
            salvo.getEmail(),
            salvo.getDataNascimento(),
            salvo.getSexo(),
            salvo.getTipo(),
            salvo.getStatus(),
            salvo.getQtSenha()
        );
    }

    public void solicitarRecuperacaoSenha(String cpf,String email) {

        Usuario usuario = usuarioRepository.findById(cpf)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"
                ));

        if(usuario.getStatus() != Status_usuarios.ATIVO) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta conta não está ativa"
            );
        }

        if(!Boolean.TRUE.equals(usuario.getEmailVerificado())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "O e-mail da conta não foi verificado"
            );
        }

        if (!usuario.getEmail().equalsIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O e-mail informado não corresponde à conta"
            );
        }

        passwordService.enviarEmailRecuperacao(usuario);
    }

    public UsuarioResponse procurarInfos(String cpf){

        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado"
            ));

        return new UsuarioResponse(
            usuario.getCpf(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getDataNascimento(),
            usuario.getSexo(),
            usuario.getTipo(),
            usuario.getStatus(),
            usuario.getQtSenha()
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

        usuario.setQtSenha(request.senha().length());
        usuario.setSenha(passwordEncoder.encode(request.senha()));

        usuarioRepository.save(usuario);
    }

    public void excluirConta(String cpf, ExcluirContaRequest request) {
        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado"
            ));
            
        if(usuario.getTipo().equals(Tipo_usuarios.ADMIN)){
            throw new BadCredentialsException("Não é possível deletar uma conta de um administrador");
        }

        if (!passwordEncoder.matches(
            request.senha(), usuario.getSenha())) {
            throw new BadCredentialsException("Senha invalida, digite a senha corretamente para excluir a conta");
        }

        usuario.setSoftdelete(true);
        usuario.setStatus(Status_usuarios.DESATIVADO);

        usuarioRepository.save(usuario);
    }

    public UsuariosPorStatusResponse tipoUsuario(String cpf,int paginaAtivos, int paginaBanidos, int paginaDesativados) {

        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario não existe"
            ));

        if (!Tipo_usuarios.ADMIN.equals(usuario.getTipo())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Sem permissão de administrador"
            );
        }

        Pageable ativosPage = PageRequest.of(paginaAtivos, 10, Sort.by("nome").ascending());

        Pageable banidosPage = PageRequest.of(paginaBanidos, 10, Sort.by("nome").ascending());

        Pageable desativadosPage = PageRequest.of(paginaDesativados, 10, Sort.by("nome").ascending());

        return new UsuariosPorStatusResponse(
            usuarioRepository.findByTipoAndStatus(Tipo_usuarios.COMUM,Status_usuarios.ATIVO,ativosPage).map(this::paraResponse),
            usuarioRepository.findByTipoAndStatus(Tipo_usuarios.COMUM,Status_usuarios.BANIDO,banidosPage).map(this::paraResponse),
            usuarioRepository.findByTipoAndStatus(Tipo_usuarios.COMUM,Status_usuarios.DESATIVADO,desativadosPage).map(this::paraResponse)
        );
    }

    private UsuarioResponse paraResponse(Usuario u) {
        return new UsuarioResponse(
            u.getCpf(),
            u.getNome(),
            u.getEmail(),
            u.getDataNascimento(),
            u.getSexo(),
            u.getTipo(),
            u.getStatus(),
            u.getQtSenha()
        );
    }

    public Page<UsuarioResponse> filtroNomeUsuarios(String nome, String cpf, int pagina) {

        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario não existe"
            ));

        if (!Tipo_usuarios.ADMIN.equals(usuario.getTipo())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Sem permissão de administrador"
            );
        }

        Pageable pageable = PageRequest.of(pagina, 10);

        Page<Usuario> usuarios = usuarioRepository.findByNomeStartingWithIgnoreCaseAndTipo(nome, Tipo_usuarios.COMUM, pageable);

        return usuarios.map(u -> new UsuarioResponse(
            u.getCpf(),
            u.getNome(),
            u.getEmail(),
            u.getDataNascimento(),
            u.getSexo(),
            u.getTipo(),
            u.getStatus(),
            u.getQtSenha()
        ));
    }

    public void banirUsuario(String cpf) {

        Usuario usuario = usuarioRepository.findByCpf(cpf)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario não existe"
            ));

        usuario.setStatus(Status_usuarios.BANIDO);

        usuarioRepository.save(usuario);
    }

   public void criaAlimento(AlimentosRequest request) {

        Boolean flag = alimentoRepository.existsByNome(request.nome());

        if(flag == true){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Nome repetido");
        }

        Alimento alimento = new Alimento();

        alimento.setId(UUID.randomUUID().toString());
        alimento.setNome(request.nome());
        alimento.setCategoria(request.categoria());
        alimento.setCalorias(request.calorias());
        alimento.setProteina(request.proteina());
        alimento.setCarboidratos(request.carboidratos());
        alimento.setGorduras(request.gorduras());

        alimentoRepository.save(alimento);
    }

    public Page<AlimentoResponse> listaAlimentos(int pagina) {

        Pageable pageable = PageRequest.of(pagina, 10);

        return alimentoRepository.findAll(pageable).map(AlimentoResponse::fromEntity);
    }

    public AlimentoResponse infoAlimento(String id) {

        Alimento alimento = alimentoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Alimento não encontrado"
            ));

        return AlimentoResponse.fromEntity(alimento);
    }

    public void editarAlimento(String id, AlimentosUpdateRequest request) {

        Alimento alimento = alimentoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Alimento não encontrado"
            ));

        if (request.nome() != null) {

            if (alimentoRepository.existsByNomeIgnoreCaseAndIdNot(
                    request.nome(), id)) {

                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Já existe um alimento com esse nome"
                );
            }

            alimento.setNome(request.nome());
        }

        if (request.categoria() != null) {
            alimento.setCategoria(request.categoria());
        }

        if (request.calorias() != null) {
            alimento.setCalorias(request.calorias());
        }

        if (request.proteina() != null) {
            alimento.setProteina(request.proteina());
        }

        if (request.carboidratos() != null) {
            alimento.setCarboidratos(request.carboidratos());
        }

        if (request.gorduras() != null) {
            alimento.setGorduras(request.gorduras());
        }

        alimentoRepository.save(alimento);
    }

    public void deletarAlimento(String id) {

        Alimento alimento = alimentoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Alimento não encontrado"
            ));

        alimentoRepository.delete(alimento);
    }

    public List<AlimentoResponse> buscaAlimentoNome(String nome) {

        return alimentoRepository
            .findByNomeContainingIgnoreCaseOrderByNomeAsc(nome)
            .stream()
            .map(AlimentoResponse::fromEntity)
            .toList();
    }

    public void criaRestricao(RestricaoRequest request) {

        if (restricoesRepository.findByNomeIgnoreCase(request.nome()).isPresent()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Já existe uma restrição com esse nome"
            );
        }

        Restricao restricao = new Restricao();

        restricao.setId(UUID.randomUUID().toString());
        restricao.setNome(request.nome());
        restricao.setTipo(request.tipo());

        restricoesRepository.save(restricao);
    }

    public Page<RestricaoResponse> listaRestricoes(int pagina) {

        Pageable pageable = PageRequest.of(pagina, 10);

        return restricoesRepository.findAll(pageable)
            .map(RestricaoResponse::fromEntity);
    }

    public RestricaoResponse infoRestricao(String id) {

        Restricao restricao = restricoesRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Restrição não encontrada"
            ));

        return RestricaoResponse.fromEntity(restricao);
    }

    public void editarRestricao(String id, RestricaoUpdateRequest request) {

        Restricao restricao = restricoesRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Restrição não encontrada"
                ));

            if (request.nome() != null) {

                if (restricoesRepository.existsByNomeIgnoreCaseAndIdNot(
                        request.nome(), id)) {

                    throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Já existe uma restrição com esse nome"
                    );
                }

                restricao.setNome(request.nome());
            }

            if (request.tipo() != null) {
                restricao.setTipo(request.tipo());
            }

            if (request.nome() != null || request.tipo() != null) {
                restricoesRepository.save(restricao);
            }
    }

    public void deletarRestricao(String id) {

        Restricao restricao = restricoesRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Restrição não encontrada"
            ));

        restricoesRepository.delete(restricao);
    }

    public Page<RestricaoResponse> buscaRestricao(String nome, Tipo_restricoes tipo, int pagina) {

        Pageable pageable = PageRequest.of(pagina, 10);

        Page<Restricao> restricoes;

        if (nome != null && tipo != null) {
            restricoes = restricoesRepository.findByNomeStartingWithIgnoreCaseAndTipoOrderByNomeAsc(nome, tipo, pageable);
        } else if (nome != null) {
            restricoes = restricoesRepository.findByNomeStartingWithIgnoreCaseOrderByNomeAsc(nome, pageable);
        } else if (tipo != null) {
            restricoes = restricoesRepository.findByTipo(tipo, pageable);

        } else {
            restricoes = restricoesRepository.findAll(pageable);
        }

        return restricoes.map(RestricaoResponse::fromEntity);
    }
}
