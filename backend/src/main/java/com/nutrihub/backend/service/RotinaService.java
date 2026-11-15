package com.nutrihub.backend.service;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nutrihub.backend.dto.*;
import com.nutrihub.backend.entity.*;
import com.nutrihub.backend.enums.*;
import com.nutrihub.backend.repository.*;
import com.nutrihub.backend.validation.GeradorRotinaValidation;

@Service
public class RotinaService {
    private final RotinaRepository rotinaRepository;
    private final RotinaTreinoRepository rotinaTreinoRepository;
    private final HorarioSonoRepository horarioSonoRepository;
    private final PreferenciaGrupoMuscularRepository preferenciaGrupoRepository;
    private final RestricaoAlimentarRepository restricaoAlimentarRepository;
    private final PreferenciaAlimentarRepository preferenciaAlimentarRepository;
    private final RestricoesRepository restricaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlimentoRepository alimentoRepository;
    private final RotinaRefeicoesRepository rotinaRefeicoesRepository;
    private final RotinaRefeicaoAlimentosRepository rotinaRefeicaoAlimentosRepository;
    private final GeradorRotinaValidation geradorRotinaValidation;

    public RotinaService(
            RotinaRepository rotinaRepository,
            RotinaTreinoRepository rotinaTreinoRepository,
            HorarioSonoRepository horarioSonoRepository,
            PreferenciaGrupoMuscularRepository preferenciaGrupoRepository,
            RestricaoAlimentarRepository restricaoAlimentarRepository,
            PreferenciaAlimentarRepository preferenciaAlimentarRepository,
            RestricoesRepository restricaoRepository,
            AlimentoRepository alimentoRepository,
            UsuarioRepository usuarioRepository,
            RotinaRefeicoesRepository rotinaRefeicoesRepository,
            RotinaRefeicaoAlimentosRepository rotinaRefeicaoAlimentosRepository,
            GeradorRotinaValidation geradorRotinaValidation) {
        this.rotinaRepository = rotinaRepository;
        this.rotinaTreinoRepository = rotinaTreinoRepository;
        this.horarioSonoRepository = horarioSonoRepository;
        this.preferenciaGrupoRepository = preferenciaGrupoRepository;
        this.restricaoAlimentarRepository = restricaoAlimentarRepository;
        this.preferenciaAlimentarRepository = preferenciaAlimentarRepository;
        this.restricaoRepository = restricaoRepository;
        this.alimentoRepository = alimentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.rotinaRefeicoesRepository = rotinaRefeicoesRepository;
        this.rotinaRefeicaoAlimentosRepository = rotinaRefeicaoAlimentosRepository;
        this.geradorRotinaValidation = geradorRotinaValidation;
    }

    private Rotinas buscarRotinaUsuario(String cpf) {

        return rotinaRepository.findByUsuarioCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não possui rotina cadastrada"));
    }

    private String gerarId() {
        return UUID.randomUUID().toString();
    }

    @Transactional
    public String criarRotina(RotinaRequest request, String cpf) {

        Usuario usuario = buscarUsuario(cpf);

        if (rotinaRepository.existsByUsuarioCpf(cpf)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "O usuário já possui uma rotina cadastrada"
            );
        }

        validarPreferenciasMusculares(request);

        Rotinas rotina = new Rotinas();

        rotina.setId(UUID.randomUUID().toString());
        rotina.setUsuario(usuario);
        rotina.setObjetivo(request.objetivo());
        rotina.setPeso(request.peso());
        rotina.setAltura(request.altura());
        rotina.setDivisao(request.divisao());
        rotina.setDistribuicao(request.distribuicao());

        rotinaRepository.save(rotina);

        if (request.distribuicao() == Distribuicao_rotina.PRIORIDADE) {

            request.preferenciasMusculares().forEach((grupo, prioridade) -> {

                PreferenciaGruposMusculares preferencia = new PreferenciaGruposMusculares();

                preferencia.setId(UUID.randomUUID().toString());
                preferencia.setRotina(rotina);
                preferencia.setGrupo(grupo);
                preferencia.setPrioridade(prioridade);

                preferenciaGrupoRepository.save(preferencia);
            });

        } else {

            for (Grupo_treino grupo : Grupo_treino.values()) {

                PreferenciaGruposMusculares preferencia = new PreferenciaGruposMusculares();

                preferencia.setId(UUID.randomUUID().toString());
                preferencia.setRotina(rotina);
                preferencia.setGrupo(grupo);
                preferencia.setPrioridade(1);

                preferenciaGrupoRepository.save(preferencia);
            }

        }

        return rotina.getId();
    }

    @Transactional
    public void criarTreinos(RotinaTreinoRequest request, String cpf) {

        Rotinas rotina = buscarRotinaDoUsuario(request.idRotina(), cpf);

        if (rotinaTreinoRepository.existsByRotinaId(rotina.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta rotina já possui treinos cadastrados");
        }

        if (request.horarioInicio().equals(request.horarioFim())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Os horários de abertura e fechamento não podem ser iguais");
        }

        Set<Dia_semana> dias = new HashSet<>(request.diaSemanas());

        if (dias.size() != request.diaSemanas().size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Existem dias da semana repetidos");
        }

        for (Dia_semana dia : dias) {

            RotinaTreinos treino = new RotinaTreinos();

            treino.setId(UUID.randomUUID().toString());
            treino.setRotina(rotina);
            treino.setDiaSemana(dia);
            treino.setHorarioInicio(request.horarioInicio());
            treino.setHorarioFim(request.horarioFim());

            rotinaTreinoRepository.save(treino);
        }
    }

    @Transactional
    public void criarHorariosSono(HorarioSonoRequest request, String cpf) {

        Rotinas rotina = buscarRotinaDoUsuario(request.idRotina(), cpf);

        if (horarioSonoRepository.existsByRotinaId(rotina.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta rotina já possui horários de sono cadastrados");
        }

        validarHorariosSono(request);

        if (Boolean.TRUE.equals(request.horariosIguais())) {

            HorarioSonoItemRequest horario = request.horarios().get(0);

            for (Dia_semana dia : Dia_semana.values()) {
                salvarHorarioSono(rotina, dia, horario);
            }

        } else {

            for (HorarioSonoItemRequest horario : request.horarios()) {
                salvarHorarioSono(
                        rotina,
                        horario.diaSemana(),
                        horario);
            }
        }
    }

    @Transactional
    public void salvarRestricoes(RestricoesAlimentaresRequest request, String cpf) {

        Usuario usuario = buscarUsuario(cpf);

        Set<String> ids = new HashSet<>(request.restricoes());

        if (ids.size() != request.restricoes().size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Existem restrições repetidas");
        }

        List<Restricao> restricoes = restricaoRepository.findAllById(ids);

        if (restricoes.size() != ids.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Uma ou mais restrições não existem");
        }

        restricaoAlimentarRepository.deleteByUsuarioCpf(cpf);

        for (Restricao restricao : restricoes) {

            RestricoesAlimentares associacao = new RestricoesAlimentares();

            associacao.setId(UUID.randomUUID().toString());
            associacao.setUsuario(usuario);
            associacao.setRestricao(restricao);

            restricaoAlimentarRepository.save(associacao);
        }
    }

    @Transactional
    public void salvarAlimentosPreferidos(AlimentosPreferidosRequest request, String cpf) {

        Usuario usuario = buscarUsuario(cpf);

        Set<String> ids = new HashSet<>(request.alimentos());

        if (ids.size() < 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione pelo menos 5 alimentos diferentes");
        }

        List<Alimento> alimentos = alimentoRepository.findAllById(ids);

        if (alimentos.size() != ids.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Um ou mais alimentos não existem");
        }

        preferenciaAlimentarRepository.deleteByUsuarioCpf(cpf);

        for (Alimento alimento : alimentos) {

            PreferenciasAlimentares preferencia = new PreferenciasAlimentares();

            preferencia.setId(UUID.randomUUID().toString());
            preferencia.setUsuario(usuario);
            preferencia.setAlimento(alimento);
            preferencia.setPreferencia(Tipo_preferencias_alimentares.GOSTO);

            preferenciaAlimentarRepository.save(preferencia);
        }
    }

    private Usuario buscarUsuario(String cpf) {

        return usuarioRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"));
    }

    private Rotinas buscarRotinaDoUsuario(String idRotina, String cpf) {

        return rotinaRepository.findByIdAndUsuarioCpf(idRotina, cpf)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Rotina não encontrada para este usuário"));
    }

    private void validarPreferenciasMusculares(RotinaRequest request) {

        Map<Grupo_treino, Integer> preferencias = request.preferenciasMusculares();

        if (request.distribuicao() == Distribuicao_rotina.BALANCEADO) {

            if (preferencias != null && !preferencias.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Distribuição balanceada não permite prioridades musculares");
            }

            return;
        }

        if (request.distribuicao() == Distribuicao_rotina.PRIORIDADE) {

            if (preferencias == null || preferencias.size() != 3) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Informe os três grupos musculares");
            }

            Set<Grupo_treino> grupos = Set.of(
                    Grupo_treino.SUPERIORES,
                    Grupo_treino.ABDOMINAL,
                    Grupo_treino.INFERIORES);

            if (!preferencias.keySet().equals(grupos)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Grupos musculares inválidos");
            }

            if (!new HashSet<>(preferencias.values())
                    .equals(Set.of(1, 2, 3))) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "As prioridades devem ser 1, 2 e 3, sem repetições");
            }
        }
    }

    private void validarHorariosSono(HorarioSonoRequest request) {

        List<HorarioSonoItemRequest> horarios = request.horarios();

        if (Boolean.TRUE.equals(request.horariosIguais())) {

            if (horarios.size() != 1) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Informe apenas um horário para todos os dias");
            }

            if (horarios.get(0).diaSemana() != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Não informe um dia específico para horários iguais");
            }

            return;
        }

        if (horarios.size() != Dia_semana.values().length) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe os horários dos sete dias da semana");
        }

        Set<Dia_semana> dias = new HashSet<>();

        for (HorarioSonoItemRequest horario : horarios) {

            if (horario.diaSemana() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "O dia da semana é obrigatório");
            }

            if (!dias.add(horario.diaSemana())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Existem dias da semana repetidos");
            }
        }
    }

    private void salvarHorarioSono(Rotinas rotina, Dia_semana dia, HorarioSonoItemRequest horario) {

        HorariosSono sono = new HorariosSono();

        sono.setId(UUID.randomUUID().toString());
        sono.setRotina(rotina);
        sono.setDiaSemana(dia);
        sono.setHorarioDormir(horario.horarioDormir());
        sono.setHorarioAcordar(horario.horarioAcordar());

        horarioSonoRepository.save(sono);
    }

    private List<RotinaResposeUsuario.RefeicaoResponse> montarRefeicoesResponse(String idRotina) {

        List<RotinaRefeicoes> refeicoes = rotinaRefeicoesRepository.findAllByRotina_Id(idRotina);

        if (refeicoes.isEmpty()) {
            return List.of();
        }

        List<RotinaRefeicaoAlimentos> alimentosRefeicoes = rotinaRefeicaoAlimentosRepository
                .findAllByRefeicao_Rotina_Id(idRotina);

        Map<String, List<RotinaRefeicaoAlimentos>> alimentosPorRefeicao = alimentosRefeicoes.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getRefeicao().getId()));

        return refeicoes.stream()
                .sorted(
                        Comparator
                                .comparingInt((RotinaRefeicoes r) -> r.getDiaSemana().ordinal())
                                .thenComparing(RotinaRefeicoes::getHorario))
                .map(refeicao -> {

                    List<RotinaResposeUsuario.RefeicaoAlimentoResponse> alimentos = alimentosPorRefeicao
                            .getOrDefault(refeicao.getId(), List.of())
                            .stream()
                            .map(item -> new RotinaResposeUsuario.RefeicaoAlimentoResponse(

                                    item.getAlimento().getId(),

                                    item.getAlimento().getNome(),

                                    item.getQuantidade()

                            ))
                            .sorted(Comparator.comparing(
                                    RotinaResposeUsuario.RefeicaoAlimentoResponse::nome))
                            .toList();

                    return new RotinaResposeUsuario.RefeicaoResponse(

                            refeicao.getId(),

                            refeicao.getDiaSemana(),

                            refeicao.getNome(),

                            refeicao.getHorario(),

                            alimentos);
                })
                .toList();
    }

    private RotinaResposeUsuario montarRotinaResponse(Rotinas rotina, String cpf) {

        String idRotina = rotina.getId();

        List<PreferenciaGruposMusculares> preferencias = preferenciaGrupoRepository.findAllByRotinaId(idRotina);

        Map<String, Integer> grupos = new LinkedHashMap<>();

        for (PreferenciaGruposMusculares preferencia : preferencias) {

            grupos.put(
                    preferencia.getGrupo().toString(),
                    preferencia.getPrioridade());
        }

        List<RotinaTreinos> treinos = rotinaTreinoRepository.findAllByRotinaId(idRotina);

        List<RotinaResposeUsuario.TreinoResponse> treinosResponse = treinos.stream()
                .sorted(Comparator.comparingInt(
                        t -> t.getDiaSemana().ordinal()))
                .map(treino -> new RotinaResposeUsuario.TreinoResponse(

                        treino.getDiaSemana(),

                        treino.getHorarioInicio(),

                        treino.getHorarioFim(),

                        treino.getGrupo() == null
                                ? null
                                : treino.getGrupo().toString()

                ))
                .toList();

        List<HorariosSono> horarios = horarioSonoRepository.findAllByRotinaId(idRotina);

        List<RotinaResposeUsuario.SonoResponse> sonoResponse = horarios.stream()
                .sorted(Comparator.comparingInt(
                        h -> h.getDiaSemana().ordinal()))
                .map(horario -> new RotinaResposeUsuario.SonoResponse(

                        horario.getDiaSemana(),

                        horario.getHorarioDormir(),

                        horario.getHorarioAcordar()

                ))
                .toList();

        List<RestricoesAlimentares> restricoes = restricaoAlimentarRepository.findAllByUsuarioCpf(cpf);

        List<ItemSelecionadoResponse> restricoesResponse = restricoes.stream()
                .map(restricao -> new ItemSelecionadoResponse(

                        restricao.getRestricao().getId(),

                        restricao.getRestricao().getNome()

                ))
                .sorted(Comparator.comparing(ItemSelecionadoResponse::nome))
                .toList();

        List<PreferenciasAlimentares> alimentos = preferenciaAlimentarRepository.findAllByUsuarioCpf(cpf);

        List<ItemSelecionadoResponse> alimentosResponse = alimentos.stream()
                .map(preferencia -> new ItemSelecionadoResponse(

                        preferencia.getAlimento().getId(),

                        preferencia.getAlimento().getNome()

                ))
                .sorted(Comparator.comparing(ItemSelecionadoResponse::nome))
                .toList();

        List<RotinaResposeUsuario.RefeicaoResponse> refeicoesResponse = montarRefeicoesResponse(rotina.getId());

        return new RotinaResposeUsuario(

                rotina.getId(),

                rotina.getObjetivo(),

                rotina.getPeso(),

                rotina.getAltura(),

                rotina.getDivisao(),

                rotina.getDistribuicao(),

                grupos,

                treinosResponse,

                sonoResponse,

                restricoesResponse,

                alimentosResponse,

                refeicoesResponse

        );
    }

    @Transactional
    public RotinaUsuarioResultado verificarRotinaUsuario(String cpf) {

        Optional<Rotinas> rotinaOptional = rotinaRepository.findByUsuarioCpf(cpf);

        if (rotinaOptional.isEmpty()) {
            return new RotinaUsuarioResultado(
                    "usuario sem rotina",
                    null);
        }

        Rotinas rotina = rotinaOptional.get();

        boolean formulario1 = verificarFormulario1(rotina);
        boolean formulario2 = verificarFormulario2(rotina);
        boolean formulario3 = verificarFormulario3(rotina);
        boolean formulario5 = verificarFormulario5(cpf);

        if (!formulario1 ||
                !formulario2 ||
                !formulario3 ||
                !formulario5) {

            excluirRotinaIncompleta(rotina, cpf);

            return new RotinaUsuarioResultado(
                    "rotina corrompida",
                    null);
        }

        RotinaResposeUsuario response = montarRotinaResponse(rotina, cpf);

        return new RotinaUsuarioResultado(
                null,
                response);
    }

    private boolean verificarFormulario1(Rotinas rotina) {

        if (rotina.getObjetivo() == null ||
            rotina.getPeso() == null ||
            rotina.getAltura() == null ||
            rotina.getDivisao() == null ||
            rotina.getDistribuicao() == null) {

            return false;
        }

        if (rotina.getPeso().signum() <= 0 ||
            rotina.getAltura().signum() <= 0) {

            return false;
        }

        List<PreferenciaGruposMusculares> preferencias =
                preferenciaGrupoRepository.findAllByRotinaId(rotina.getId());

        if (preferencias.size() != Grupo_treino.values().length) {
            return false;
        }

        Set<Grupo_treino> grupos = new HashSet<>();
        Set<Integer> prioridades = new HashSet<>();

        for (PreferenciaGruposMusculares preferencia : preferencias) {

            if (preferencia.getGrupo() == null ||
                preferencia.getPrioridade() == null) {

                return false;
            }

            if (!grupos.add(preferencia.getGrupo())) {
                return false;
            }

            prioridades.add(preferencia.getPrioridade());
        }

        if (!grupos.equals(EnumSet.allOf(Grupo_treino.class))) {
            return false;
        }

        if (rotina.getDistribuicao() == Distribuicao_rotina.BALANCEADO) {

            return prioridades.equals(Set.of(1));
        }

        if (rotina.getDistribuicao() == Distribuicao_rotina.PRIORIDADE) {

            return prioridades.equals(Set.of(1, 2, 3));
        }

        return false;
    }

    private boolean verificarFormulario2(Rotinas rotina) {

        List<RotinaTreinos> treinos = rotinaTreinoRepository.findAllByRotinaId(rotina.getId());

        if (treinos.isEmpty()) {
            return false;
        }

        Set<Dia_semana> dias = new HashSet<>();

        for (RotinaTreinos treino : treinos) {

            if (treino.getDiaSemana() == null ||
                    treino.getHorarioInicio() == null ||
                    treino.getHorarioFim() == null) {

                return false;
            }

            if (treino.getHorarioInicio().equals(treino.getHorarioFim())) {
                return false;
            }

            if (!dias.add(treino.getDiaSemana())) {
                return false;
            }
        }

        return true;
    }

    private boolean verificarFormulario3(Rotinas rotina) {

        List<HorariosSono> horarios = horarioSonoRepository.findAllByRotinaId(rotina.getId());

        if (horarios.size() != Dia_semana.values().length) {
            return false;
        }

        Set<Dia_semana> dias = new HashSet<>();

        for (HorariosSono horario : horarios) {

            if (horario.getDiaSemana() == null ||
                    horario.getHorarioDormir() == null ||
                    horario.getHorarioAcordar() == null) {

                return false;
            }

            if (!dias.add(horario.getDiaSemana())) {
                return false;
            }
        }

        return dias.size() == Dia_semana.values().length;
    }

    private boolean verificarFormulario5(String cpf) {

        List<PreferenciasAlimentares> preferencias = preferenciaAlimentarRepository.findAllByUsuarioCpf(cpf);

        if (preferencias.size() < 5) {
            return false;
        }

        Set<String> alimentos = new HashSet<>();

        for (PreferenciasAlimentares preferencia : preferencias) {

            if (preferencia.getAlimento() == null ||
                    preferencia.getAlimento().getId() == null) {

                return false;
            }

            alimentos.add(preferencia.getAlimento().getId());
        }

        return alimentos.size() >= 5;
    }

    private void excluirRotinaIncompleta(Rotinas rotina, String cpf) {
        excluirRotinaRefeicoes(cpf);

        preferenciaAlimentarRepository.deleteByUsuarioCpf(cpf);

        restricaoAlimentarRepository.deleteByUsuarioCpf(cpf);

        rotinaRepository.delete(rotina);
        rotinaRepository.flush();
    }

    @Transactional
    public void excluirRotinaRefeicoes(String cpf) {
        String idRotina = rotinaRepository.findIdByUsuarioCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Rotina não encontrada para o usuário"));

        List<String> idsRefeicoes = rotinaRefeicoesRepository.findIdsByRotinaId(idRotina);

        if (!idsRefeicoes.isEmpty()) {
            rotinaRefeicaoAlimentosRepository.deleteByRefeicaoIdIn(idsRefeicoes);
            rotinaRefeicoesRepository.deleteByRotinaId(idRotina);
        }
    }

    @Transactional(readOnly = true)
    public RotinaUpdateForms1Response buscarForms1(String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        List<PreferenciaGruposMusculares> preferencias = preferenciaGrupoRepository.findAllByRotinaId(rotina.getId());

        Map<String, Integer> grupos = new LinkedHashMap<>();

        for (PreferenciaGruposMusculares preferencia : preferencias) {

            grupos.put(
                    preferencia.getGrupo().toString(),
                    preferencia.getPrioridade());
        }

        return new RotinaUpdateForms1Response(
                rotina.getObjetivo(),
                rotina.getPeso(),
                rotina.getAltura(),
                rotina.getDivisao(),
                rotina.getDistribuicao(),
                grupos);
    }

    @Transactional
    public void atualizarForms1(RotinaUpdateForms1Request request, String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        validarPreferenciasMusculares(
                request.distribuicao(),
                request.preferenciasMusculares());

        excluirRotinaRefeicoes(cpf);

        rotina.setObjetivo(request.objetivo());
        rotina.setPeso(request.peso());
        rotina.setAltura(request.altura());
        rotina.setDivisao(request.divisao());
        rotina.setDistribuicao(request.distribuicao());

        List<PreferenciaGruposMusculares> antigas = preferenciaGrupoRepository.findAllByRotinaId(rotina.getId());

        preferenciaGrupoRepository.deleteAll(antigas);
        preferenciaGrupoRepository.flush();

        if (request.distribuicao() == Distribuicao_rotina.PRIORIDADE) {

            request.preferenciasMusculares().forEach((grupo, prioridade) -> {

                PreferenciaGruposMusculares preferencia = new PreferenciaGruposMusculares();

                preferencia.setId(gerarId());
                preferencia.setRotina(rotina);
                preferencia.setGrupo(grupo);
                preferencia.setPrioridade(prioridade);

                preferenciaGrupoRepository.save(preferencia);
            });

        } else {

            for (Grupo_treino grupo : Grupo_treino.values()) {

                PreferenciaGruposMusculares preferencia = new PreferenciaGruposMusculares();

                preferencia.setId(gerarId());
                preferencia.setRotina(rotina);
                preferencia.setGrupo(grupo);
                preferencia.setPrioridade(1);

                preferenciaGrupoRepository.save(preferencia);
            }
        }

        rotinaRepository.save(rotina);
    }

    private void validarPreferenciasMusculares(
            Distribuicao_rotina distribuicao,
            Map<Grupo_treino, Integer> preferencias) {

        if (distribuicao == Distribuicao_rotina.BALANCEADO) {

            if (preferencias != null && !preferencias.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A distribuição balanceada não permite prioridades musculares");
            }

            return;
        }

        if (distribuicao == Distribuicao_rotina.PRIORIDADE) {

            if (preferencias == null || preferencias.size() != Grupo_treino.values().length) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Informe os três grupos musculares");
            }

            if (!preferencias.keySet().equals(Set.of(Grupo_treino.values()))) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Grupos musculares inválidos");
            }

            if (!new HashSet<>(preferencias.values()).equals(Set.of(1, 2, 3))) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Prioridades inválidas");
            }

            return;
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Distribuição inválida");
    }

    @Transactional(readOnly = true)
    public RotinaUpdateForms2Response buscarForms2(String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        List<RotinaTreinos> treinos = rotinaTreinoRepository.findAllByRotinaId(rotina.getId());

        if (treinos.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Nenhum treino cadastrado");
        }

        LocalTime inicio = treinos.get(0).getHorarioInicio();
        LocalTime fim = treinos.get(0).getHorarioFim();

        if (inicio == null || fim == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Horários da academia inválidos");
        }

        Set<Dia_semana> dias = new HashSet<>();

        for (RotinaTreinos treino : treinos) {

            if (treino.getDiaSemana() == null ||
                    !inicio.equals(treino.getHorarioInicio()) ||
                    !fim.equals(treino.getHorarioFim()) ||
                    !dias.add(treino.getDiaSemana())) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Dados de treino inconsistentes");
            }
        }

        List<Dia_semana> diasOrdenados = new ArrayList<>(dias);

        diasOrdenados.sort(Comparator.comparingInt(Enum::ordinal));

        return new RotinaUpdateForms2Response(
                diasOrdenados,
                inicio,
                fim);
    }

    @Transactional
    public void atualizarForms2(RotinaUpdateForms2Request request, String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        if (request.horarioInicio().equals(request.horarioFim())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Os horários da academia não podem ser iguais");
        }

        excluirRotinaRefeicoes(cpf);

        Set<Dia_semana> dias = new HashSet<>(request.diaSemanas());

        if (dias.size() != request.diaSemanas().size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Dias da semana repetidos");
        }

        List<RotinaTreinos> antigos = rotinaTreinoRepository.findAllByRotinaId(rotina.getId());

        rotinaTreinoRepository.deleteAll(antigos);
        rotinaTreinoRepository.flush();

        for (Dia_semana dia : request.diaSemanas()) {

            RotinaTreinos treino = new RotinaTreinos();

            treino.setId(gerarId());
            treino.setRotina(rotina);
            treino.setDiaSemana(dia);
            treino.setHorarioInicio(request.horarioInicio());
            treino.setHorarioFim(request.horarioFim());

            rotinaTreinoRepository.save(treino);
        }
    }

    @Transactional(readOnly = true)
    public RotinaUpdateForms3Response buscarForms3(String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        List<HorariosSono> horarios = horarioSonoRepository.findAllByRotinaId(rotina.getId());

        if (horarios.size() != Dia_semana.values().length) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Horários de sono incompletos");
        }

        Set<Dia_semana> dias = new HashSet<>();

        for (HorariosSono horario : horarios) {

            if (horario.getDiaSemana() == null ||
                    horario.getHorarioDormir() == null ||
                    horario.getHorarioAcordar() == null ||
                    !dias.add(horario.getDiaSemana())) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Horários de sono inconsistentes");
            }
        }

        horarios.sort(
                Comparator.comparingInt(h -> h.getDiaSemana().ordinal()));

        HorariosSono primeiro = horarios.get(0);

        boolean horariosIguais = horarios.stream()
                .allMatch(h -> h.getHorarioDormir().equals(primeiro.getHorarioDormir()) &&
                        h.getHorarioAcordar().equals(primeiro.getHorarioAcordar()));

        List<HorarioSonoItemRequest> itens = new ArrayList<>();

        if (horariosIguais) {

            itens.add(new HorarioSonoItemRequest(
                    null,
                    primeiro.getHorarioDormir(),
                    primeiro.getHorarioAcordar()));

        } else {

            for (HorariosSono horario : horarios) {

                itens.add(new HorarioSonoItemRequest(
                        horario.getDiaSemana(),
                        horario.getHorarioDormir(),
                        horario.getHorarioAcordar()));
            }
        }

        return new RotinaUpdateForms3Response(
                horariosIguais,
                itens);
    }

    @Transactional
    public void atualizarForms3(RotinaUpdateForms3Request request, String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        validarHorariosSono(
                request.horariosIguais(),
                request.horarios());

        excluirRotinaRefeicoes(cpf);

        List<HorariosSono> antigos = horarioSonoRepository.findAllByRotinaId(rotina.getId());

        horarioSonoRepository.deleteAll(antigos);
        horarioSonoRepository.flush();

        if (Boolean.TRUE.equals(request.horariosIguais())) {

            HorarioSonoItemRequest horario = request.horarios().get(0);

            for (Dia_semana dia : Dia_semana.values()) {
                salvarHorarioSono(rotina, dia, horario);
            }

        } else {

            for (HorarioSonoItemRequest horario : request.horarios()) {
                salvarHorarioSono(
                        rotina,
                        horario.diaSemana(),
                        horario);
            }
        }
    }

    private void validarHorariosSono(
            Boolean horariosIguais,
            List<HorarioSonoItemRequest> horarios) {

        if (horarios == null || horarios.isEmpty() ||
                horariosIguais == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe os horários de sono");
        }

        for (HorarioSonoItemRequest horario : horarios) {

            if (horario == null ||
                    horario.horarioDormir() == null ||
                    horario.horarioAcordar() == null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Os horários de dormir e acordar são obrigatórios");
            }
        }

        if (horariosIguais) {

            if (horarios.size() != 1 ||
                    horarios.get(0).diaSemana() != null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Informe apenas um conjunto de horários, sem dia da semana");
            }

            return;
        }

        if (horarios.size() != Dia_semana.values().length) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe os horários dos sete dias");
        }

        Set<Dia_semana> dias = new HashSet<>();

        for (HorarioSonoItemRequest horario : horarios) {

            if (horario.diaSemana() == null ||
                    !dias.add(horario.diaSemana())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Dias da semana inválidos ou repetidos");
            }
        }
    }

    @Transactional(readOnly = true)
    public RotinaUpdateForms4Response buscarForms4(String cpf) {

        buscarRotinaUsuario(cpf);

        List<RestricoesAlimentares> associacoes = restricaoAlimentarRepository.findAllByUsuarioCpf(cpf);

        List<ItemSelecionadoResponse> restricoes = associacoes.stream()
                .map(associacao -> new ItemSelecionadoResponse(
                        associacao.getRestricao().getId(),
                        associacao.getRestricao().getNome()))
                .sorted(Comparator.comparing(ItemSelecionadoResponse::nome))
                .toList();

        return new RotinaUpdateForms4Response(restricoes);
    }

    @Transactional
    public void atualizarForms4(RotinaUpdateForms4Request request, String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        Usuario usuario = rotina.getUsuario();

        Set<String> ids = new HashSet<>(request.restricoes());

        if (ids.size() != request.restricoes().size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Existem restrições repetidas");
        }

        List<Restricao> restricoes = restricaoRepository.findAllById(ids);

        if (restricoes.size() != ids.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Uma ou mais restrições não existem");
        }

        excluirRotinaRefeicoes(cpf);

        List<RestricoesAlimentares> antigas = restricaoAlimentarRepository.findAllByUsuarioCpf(cpf);

        restricaoAlimentarRepository.deleteAll(antigas);
        restricaoAlimentarRepository.flush();

        for (Restricao restricao : restricoes) {

            RestricoesAlimentares associacao = new RestricoesAlimentares();

            associacao.setId(gerarId());
            associacao.setUsuario(usuario);
            associacao.setRestricao(restricao);

            restricaoAlimentarRepository.save(associacao);
        }
    }

    @Transactional(readOnly = true)
    public RotinaUpdateForms5Response buscarForms5(String cpf) {

        buscarRotinaUsuario(cpf);

        List<PreferenciasAlimentares> associacoes = preferenciaAlimentarRepository.findAllByUsuarioCpf(cpf);

        List<ItemSelecionadoResponse> alimentos = associacoes.stream()
                .map(associacao -> new ItemSelecionadoResponse(
                        associacao.getAlimento().getId(),
                        associacao.getAlimento().getNome()))
                .sorted(Comparator.comparing(ItemSelecionadoResponse::nome))
                .toList();

        return new RotinaUpdateForms5Response(alimentos);
    }

    @Transactional
    public void atualizarForms5(RotinaUpdateForms5Request request, String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        Usuario usuario = rotina.getUsuario();

        Set<String> ids = new HashSet<>(request.alimentos());

        if (ids.size() < 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecione pelo menos 5 alimentos diferentes");
        }

        List<Alimento> alimentos = alimentoRepository.findAllById(ids);

        if (alimentos.size() != ids.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Um ou mais alimentos não existem");
        }

        excluirRotinaRefeicoes(cpf);

        List<PreferenciasAlimentares> antigas = preferenciaAlimentarRepository.findAllByUsuarioCpf(cpf);

        preferenciaAlimentarRepository.deleteAll(antigas);
        preferenciaAlimentarRepository.flush();

        for (Alimento alimento : alimentos) {

            PreferenciasAlimentares preferencia = new PreferenciasAlimentares();

            preferencia.setId(gerarId());
            preferencia.setUsuario(usuario);
            preferencia.setAlimento(alimento);
            preferencia.setPreferencia(Tipo_preferencias_alimentares.GOSTO);

            preferenciaAlimentarRepository.save(preferencia);
        }
    }

    @Transactional
    public void excluirRotina(String cpf, boolean confirmar) {

        if (!confirmar) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "É necessário confirmar a exclusão da rotina");
        }

        Rotinas rotina = rotinaRepository.findByUsuarioCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Rotina não encontrada para o usuário"));

        String idRotina = rotina.getId();

        List<String> idsRefeicoes = rotinaRefeicoesRepository.findIdsByRotinaId(idRotina);

        if (!idsRefeicoes.isEmpty()) {

            rotinaRefeicaoAlimentosRepository
                    .deleteByRefeicaoIdIn(idsRefeicoes);

            rotinaRefeicoesRepository.deleteByRotinaId(idRotina);
        }

        preferenciaAlimentarRepository.deleteByUsuarioCpf(cpf);

        restricaoAlimentarRepository.deleteByUsuarioCpf(cpf);

        rotinaRepository.delete(rotina);
        rotinaRepository.flush();
    }

    @Transactional(readOnly = true)
    public RotinaResposeUsuario gerarRotinaDemonstracao(String cpf) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        Usuario usuario = usuarioRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"));

        RotinaResposeUsuario dados = montarRotinaResponse(rotina, cpf);

        return geradorRotinaValidation.gerar(
                dados,
                usuario.getDataNascimento());
    }

    @Transactional
    public void salvarRotinaGerada(String cpf,RotinaResposeUsuario response) {

        Rotinas rotina = buscarRotinaUsuario(cpf);

        if (response == null ||!rotina.getId().equals(response.idRotina())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Dados da rotina inválidos");
        }

        if (response.treinos() == null ||
                response.refeicoes() == null ||
                response.refeicoes().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A rotina gerada está incompleta");
        }

        String idRotina = rotina.getId();

        Map<Dia_semana, Grupo_treino> grupos = new HashMap<>();

        for (var treino : response.treinos()) {

            Grupo_treino grupo;

            try {
                grupo = Grupo_treino.valueOf(treino.grupoMuscular());
            } catch (IllegalArgumentException | NullPointerException e) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Grupo muscular inválido");
            }

            if (grupos.putIfAbsent(treino.diaSemana(), grupo) != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Dias de treino repetidos");
            }
        }

        List<RotinaTreinos> treinosBanco = rotinaTreinoRepository.findAllByRotinaId(idRotina);

        if (treinosBanco.size() != grupos.size()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Os dias de treino não correspondem aos cadastrados");
        }

        for (RotinaTreinos treino : treinosBanco) {

            Grupo_treino grupo = grupos.get(treino.getDiaSemana());

            if (grupo == null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Dia de treino inválido");
            }

            treino.setGrupo(grupo);
        }

        List<PreferenciasAlimentares> preferencias = preferenciaAlimentarRepository.findAllByUsuarioCpf(cpf);

        Map<String, Alimento> alimentosPermitidos = new HashMap<>();

        for (PreferenciasAlimentares preferencia : preferencias) {

            Alimento alimento = preferencia.getAlimento();

            alimentosPermitidos.put(alimento.getId(), alimento);
        }

        for (var refeicao : response.refeicoes()) {

            if (refeicao == null ||
                    refeicao.diaSemana() == null ||
                    refeicao.nome() == null ||
                    refeicao.nome().isBlank() ||
                    refeicao.horario() == null ||
                    refeicao.alimentos() == null ||
                    refeicao.alimentos().isEmpty()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Refeição inválida");
            }

            for (var item : refeicao.alimentos()) {

                if (item == null ||
                        !alimentosPermitidos.containsKey(item.idAlimento()) ||
                        item.quantidade() == null ||
                        item.quantidade().signum() <= 0) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Alimento ou quantidade inválida");
                }
            }
        }

        rotinaTreinoRepository.saveAll(treinosBanco);

        excluirRotinaRefeicoes(cpf);

        for (var refeicaoGerada : response.refeicoes()) {

            RotinaRefeicoes refeicao = new RotinaRefeicoes();

            refeicao.setId(UUID.randomUUID().toString());
            refeicao.setRotina(rotina);
            refeicao.setDiaSemana(refeicaoGerada.diaSemana());
            refeicao.setNome(refeicaoGerada.nome());
            refeicao.setHorario(refeicaoGerada.horario());

            rotinaRefeicoesRepository.save(refeicao);

            for (var alimentoGerado : refeicaoGerada.alimentos()) {

                RotinaRefeicaoAlimentos associacao = new RotinaRefeicaoAlimentos();

                associacao.setId(UUID.randomUUID().toString());
                associacao.setRefeicao(refeicao);

                associacao.setAlimento(
                        alimentosPermitidos.get(alimentoGerado.idAlimento()));

                associacao.setQuantidade(alimentoGerado.quantidade());

                rotinaRefeicaoAlimentosRepository.save(associacao);
            }
        }
    }
}
