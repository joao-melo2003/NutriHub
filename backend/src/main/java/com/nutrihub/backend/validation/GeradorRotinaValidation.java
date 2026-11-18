package com.nutrihub.backend.validation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.*;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.nutrihub.backend.dto.*;
import com.nutrihub.backend.enums.Dia_semana;

@Component
public class GeradorRotinaValidation {

    private static final LocalDate SEGUNDA_BASE = LocalDate.of(2026, 1, 5);
    private static final List<String> ORDEM_DIAS = List.of(
            "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO");

    private record Bloqueio(LocalDateTime inicio, LocalDateTime fim) { }
    private record PeriodoAcordado(LocalDateTime inicio, LocalDateTime fim) { }

    public RotinaResposeUsuario gerar(RotinaResposeUsuario rotina, LocalDate dataNascimento) {
        validarDados(rotina, dataNascimento);

        int idade = Period.between(dataNascimento, LocalDate.now()).getYears();
        double peso = rotina.peso().doubleValue();
        double altura = rotina.altura().doubleValue();
        double imc = peso / (altura * altura);

        List<RotinaResposeUsuario.TreinoResponse> treinos = gerarTreinos(rotina);
        List<RotinaResposeUsuario.RefeicaoResponse> refeicoes = gerarRefeicoes(rotina, idade, imc);

        return new RotinaResposeUsuario(
                rotina.idRotina(), rotina.objetivo(), rotina.peso(), rotina.altura(),
                rotina.divisao(), rotina.distribuicao(), rotina.preferenciasMusculares(),
                treinos, rotina.horariosSono(), rotina.restricoesAlimentares(),
                rotina.alimentosPreferidos(), refeicoes);
    }

    private void validarDados(RotinaResposeUsuario rotina, LocalDate nascimento) {
        if (rotina == null || nascimento == null || nascimento.isAfter(LocalDate.now())
                || rotina.peso() == null || rotina.altura() == null
                || rotina.objetivo() == null || rotina.divisao() == null
                || rotina.distribuicao() == null || rotina.treinos() == null
                || rotina.horariosSono() == null || rotina.alimentosPreferidos() == null) {
            throw erro("Dados da rotina incompletos");
        }

        if (rotina.peso().signum() <= 0 || rotina.altura().signum() <= 0
                || rotina.altura().doubleValue() > 3) {
            throw erro("Peso ou altura inválidos");
        }

        if (rotina.treinos().isEmpty() || rotina.alimentosPreferidos().isEmpty()
                || rotina.horariosSono().size() != 7) {
            throw erro("Informe ao menos um alimento, um treino e os sete dias de sono");
        }

        Set<Dia_semana> diasSono = new HashSet<>();
        Set<Dia_semana> diasTreino = new HashSet<>();

        for (var sono : rotina.horariosSono()) {
            if (sono == null || sono.diaSemana() == null
                    || sono.horarioDormir() == null || sono.horarioAcordar() == null
                    || sono.horarioDormir().equals(sono.horarioAcordar())
                    || !diasSono.add(sono.diaSemana())) {
                throw erro("Horários de sono inválidos");
            }
            indiceDia(sono.diaSemana());
        }

        for (var treino : rotina.treinos()) {
            if (treino == null || treino.diaSemana() == null
                    || treino.horarioInicio() == null || treino.horarioFim() == null
                    || treino.horarioInicio().equals(treino.horarioFim())
                    || !diasTreino.add(treino.diaSemana())) {
                throw erro("Dados dos treinos inválidos");
            }
            indiceDia(treino.diaSemana());
        }

        for (ItemSelecionadoResponse alimento : rotina.alimentosPreferidos()) {
            if (alimento == null || alimento.id() == null || alimento.id().isBlank()
                    || alimento.nome() == null || alimento.nome().isBlank()) {
                throw erro("Alimentos favoritos inválidos");
            }
        }

        if (diasSono.size() != 7) {
            throw erro("Informe os sete dias de sono");
        }
    }

    private int indiceDia(Dia_semana dia) {
        int indice = ORDEM_DIAS.indexOf(dia.name());
        if (indice < 0) throw erro("Dia da semana desconhecido");
        return indice;
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, mensagem);
    }

    private List<RotinaResposeUsuario.TreinoResponse> gerarTreinos(RotinaResposeUsuario rotina) {
        List<RotinaResposeUsuario.TreinoResponse> originais = rotina.treinos().stream()
                .sorted(Comparator.comparingInt(t -> indiceDia(t.diaSemana())))
                .toList();

        boolean prioritario = "PRIORIDADE".equals(rotina.distribuicao().name());
        List<String> prioridades = List.of("SUPERIORES", "INFERIORES", "ABDOMINAL");

        if (prioritario) {
            Map<String, Integer> mapa = rotina.preferenciasMusculares();
            if (mapa == null || !mapa.keySet().equals(Set.of(
                    "SUPERIORES", "INFERIORES", "ABDOMINAL"))
                    || mapa.values().stream().anyMatch(Objects::isNull)
                    || !new HashSet<>(mapa.values()).equals(Set.of(1, 2, 3))) {
                throw erro("Prioridades musculares inválidas");
            }
            prioridades = mapa.entrySet().stream()
                    .sorted(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .toList();
        }

        List<RotinaResposeUsuario.TreinoResponse> resultado = new ArrayList<>();
        for (int i = 0; i < originais.size(); i++) {
            var treino = originais.get(i);
            String grupo = escolherGrupo(rotina.divisao().name(), prioritario, prioridades, i);
            resultado.add(new RotinaResposeUsuario.TreinoResponse(
                    treino.diaSemana(), treino.horarioInicio(), treino.horarioFim(), grupo));
        }
        return resultado;
    }

    private String escolherGrupo(String divisao, boolean prioritario,
                                List<String> prioridades, int indice) {
        String primeiro = prioridades.get(0);

        return switch (divisao) {
            case "ABC" -> {
                List<String> ciclo = prioritario
                        ? List.of(primeiro, prioridades.get(1), prioridades.get(2), primeiro)
                        : List.of("SUPERIORES", "INFERIORES", "ABDOMINAL");
                yield ciclo.get(indice % ciclo.size());
            }
            case "FULL_BODY" -> prioritario
                    ? "FULL_BODY - FOCO " + primeiro
                    : "FULL_BODY";
            case "UPPER_LOWER" -> {
                List<String> ciclo = prioritario && "INFERIORES".equals(primeiro)
                        ? List.of("INFERIORES", "SUPERIORES")
                        : List.of("SUPERIORES", "INFERIORES");
                String grupo = ciclo.get(indice % ciclo.size());
                yield prioritario && "ABDOMINAL".equals(primeiro) && indice % 2 == 0
                        ? grupo + " + ABDOMINAL" : grupo;
            }
            case "PUSH_PULL_LEGS" -> {
                List<String> ciclo = prioritario && "INFERIORES".equals(primeiro)
                        ? List.of("LEGS", "PUSH", "PULL")
                        : List.of("PUSH", "PULL", "LEGS");
                String grupo = ciclo.get(indice % ciclo.size());
                yield prioritario && "ABDOMINAL".equals(primeiro) && indice % 3 == 0
                        ? grupo + " + ABDOMINAL" : grupo;
            }
            case "ABCDE" -> {
                List<String> ciclo = new ArrayList<>(
                        List.of("PEITO", "COSTAS", "PERNAS", "OMBROS", "BRACOS"));
                if (prioritario && "INFERIORES".equals(primeiro)) {
                    Collections.rotate(ciclo, -2); // Começa por pernas.
                }
                String grupo = ciclo.get(indice % ciclo.size());
                yield prioritario && "ABDOMINAL".equals(primeiro) && indice % 5 == 0
                        ? grupo + " + ABDOMINAL" : grupo;
            }
            default -> throw erro("Divisão de treino inválida");
        };
    }

    private List<PeriodoAcordado> construirPeriodosAcordados(RotinaResposeUsuario rotina) {
        List<PeriodoAcordado> periodos = new ArrayList<>();

        for (int dia = -1; dia <= 6; dia++) {
            int indice = Math.floorMod(dia, 7);
            var sono = rotina.horariosSono().stream()
                    .filter(s -> indiceDia(s.diaSemana()) == indice)
                    .findFirst()
                    .orElseThrow(() -> erro("Sono não informado em um dos dias"));

            LocalDate data = SEGUNDA_BASE.plusDays(dia);
            LocalDateTime inicio = data.atTime(sono.horarioAcordar());
            LocalDateTime fim = data.atTime(sono.horarioDormir());
            if (!fim.isAfter(inicio)) fim = fim.plusDays(1);
            periodos.add(new PeriodoAcordado(inicio, fim));
        }

        for (int i = 1; i < periodos.size(); i++) {
            if (periodos.get(i - 1).fim().isAfter(periodos.get(i).inicio())) {
                throw erro("Os horários de acordar e dormir de dias consecutivos se sobrepõem");
            }
        }
        var sonoSegunda = rotina.horariosSono().stream()
                .filter(s -> indiceDia(s.diaSemana()) == 0)
                .findFirst().orElseThrow();
        LocalDateTime proximaSegunda = SEGUNDA_BASE.plusDays(7)
                .atTime(sonoSegunda.horarioAcordar());
        if (periodos.get(periodos.size() - 1).fim().isAfter(proximaSegunda)) {
            throw erro("O horário de dormir de domingo conflita com a segunda-feira");
        }

        return periodos;
    }

    private List<Bloqueio> construirBloqueiosTreino(RotinaResposeUsuario rotina) {
        List<Bloqueio> bloqueios = new ArrayList<>();
        for (int semana = -2; semana <= 2; semana++) {
            for (var treino : rotina.treinos()) {
                LocalDate data = SEGUNDA_BASE.plusDays(
                        indiceDia(treino.diaSemana()) + semana * 7L);
                LocalDateTime inicio = data.atTime(treino.horarioInicio());
                LocalDateTime fim = data.atTime(treino.horarioFim());
                if (!fim.isAfter(inicio)) fim = fim.plusDays(1);

                bloqueios.add(new Bloqueio(inicio, fim));
            }
        }
        bloqueios.sort(Comparator.comparing(Bloqueio::inicio));
        return bloqueios;
    }

    private boolean estaTreinando(LocalDateTime instante, List<Bloqueio> treinos) {
        for (Bloqueio treino : treinos) {
            if (!instante.isBefore(treino.inicio()) && instante.isBefore(treino.fim())) {
                return true;
            }
        }
        return false;
    }

    private boolean treinoNoPeriodo(PeriodoAcordado periodo, List<Bloqueio> treinos) {
        return treinos.stream().anyMatch(b -> b.inicio().isBefore(periodo.fim())
                && b.fim().isAfter(periodo.inicio()));
    }

    private long minutosLivres(PeriodoAcordado periodo, List<Bloqueio> bloqueios) {
        LocalDateTime cursor = periodo.inicio();
        long livres = 0;

        for (Bloqueio b : bloqueios) {
            if (!b.fim().isAfter(cursor)) continue;
            if (!b.inicio().isBefore(periodo.fim())) break;
            if (b.inicio().isAfter(cursor)) {
                LocalDateTime ate = b.inicio().isBefore(periodo.fim())
                        ? b.inicio() : periodo.fim();
                livres += Duration.between(cursor, ate).toMinutes();
            }
            if (b.fim().isAfter(cursor)) {
                cursor = b.fim().isBefore(periodo.fim()) ? b.fim() : periodo.fim();
            }
            if (!cursor.isBefore(periodo.fim())) break;
        }
        if (cursor.isBefore(periodo.fim())) {
            livres += Duration.between(cursor, periodo.fim()).toMinutes();
        }
        return Math.max(0, livres);
    }

    private int definirQuantidadeRefeicoes(RotinaResposeUsuario rotina,
                                           PeriodoAcordado periodo,
                                           List<Bloqueio> treinos,
                                           int totalAlimentos) {
        int desejadas = 4;
        if (totalAlimentos >= 8) desejadas++;
        if (totalAlimentos >= 16) desejadas++;
        if (rotina.objetivo().name().contains("GANHO")) desejadas++;

        if (treinoNoPeriodo(periodo, treinos)) {

            if (Set.of("FULL_BODY", "PUSH_PULL_LEGS", "ABCDE")
                    .contains(rotina.divisao().name())) {
                desejadas++;
            }
        }
        desejadas = Math.min(7, desejadas);

        long livres = minutosLivres(periodo, treinos);
        int capacidade = Math.max(1, (int) Math.ceil(livres / 135.0));
        return Math.min(desejadas, capacidade);
    }

    private List<LocalDateTime> horariosCandidatos(PeriodoAcordado periodo,
                                                  List<Bloqueio> treinos) {
        NavigableSet<LocalDateTime> candidatos = new TreeSet<>();
        candidatos.add(periodo.inicio());
        candidatos.add(periodo.fim());

        for (LocalDateTime horario = periodo.inicio();
             !horario.isAfter(periodo.fim()); horario = horario.plusMinutes(15)) {
            candidatos.add(horario);
        }

        for (Bloqueio treino : treinos) {
            if (!treino.fim().isBefore(periodo.inicio())
                    && !treino.fim().isAfter(periodo.fim())) {
                candidatos.add(treino.fim());
            }
        }
        candidatos.removeIf(h -> estaTreinando(h, treinos));
        return new ArrayList<>(candidatos);
    }

    private List<LocalDateTime> escolherHorarios(List<LocalDateTime> candidatos,
                                                 PeriodoAcordado periodo,
                                                 List<Bloqueio> treinos,
                                                 int quantidade, int intervaloMinimo) {
        int m = candidatos.size();
        if (m < quantidade) return List.of();

        double[][] custo = new double[quantidade + 1][m];
        int[][] anterior = new int[quantidade + 1][m];
        for (int i = 0; i <= quantidade; i++) {
            Arrays.fill(custo[i], Double.POSITIVE_INFINITY);
            Arrays.fill(anterior[i], -1);
        }

        long duracao = Duration.between(periodo.inicio(), periodo.fim()).toMinutes();
        long margem = Math.min(45, duracao / (quantidade + 1));
        long primeiro = margem;
        long ultimo = Math.max(primeiro, duracao - margem);

        for (int pos = 1; pos <= quantidade; pos++) {
            long deslocamento = quantidade == 1 ? duracao / 2
                    : Math.round(primeiro + (ultimo - primeiro)
                    * ((pos - 1.0) / (quantidade - 1)));
            LocalDateTime ideal = periodo.inicio().plusMinutes(deslocamento);

            for (int j = pos - 1; j < m; j++) {
                LocalDateTime candidato = candidatos.get(j);
                double penalidade = Math.abs(Duration.between(ideal, candidato).toMinutes());

                for (Bloqueio treino : treinos) {
                    long antes = Duration.between(candidato, treino.inicio()).toMinutes();
                    long depois = Duration.between(treino.fim(), candidato).toMinutes();
                    if ((antes >= 0 && antes < 15) || (depois >= 0 && depois < 15)) {
                        penalidade += 15;
                    }
                }

                if (pos == 1) {
                    custo[pos][j] = penalidade;
                    continue;
                }
                for (int k = pos - 2; k < j; k++) {
                    long distancia = Duration.between(candidatos.get(k), candidato).toMinutes();
                    if (distancia < intervaloMinimo) continue;
                    double novo = custo[pos - 1][k] + penalidade;
                    if (novo < custo[pos][j]) {
                        custo[pos][j] = novo;
                        anterior[pos][j] = k;
                    }
                }
            }
        }

        int indiceFinal = -1;
        double melhor = Double.POSITIVE_INFINITY;
        for (int j = quantidade - 1; j < m; j++) {
            if (custo[quantidade][j] < melhor) {
                melhor = custo[quantidade][j];
                indiceFinal = j;
            }
        }
        if (indiceFinal == -1 || !Double.isFinite(melhor)) return List.of();

        LinkedList<LocalDateTime> resultado = new LinkedList<>();
        int j = indiceFinal;
        for (int pos = quantidade; pos >= 1; pos--) {
            resultado.addFirst(candidatos.get(j));
            j = anterior[pos][j];
        }
        return resultado;
    }

    private List<LocalDateTime> distribuirHorarios(PeriodoAcordado periodo,
                                                  List<Bloqueio> treinos,
                                                  int desejadas) {
        List<LocalDateTime> candidatos = horariosCandidatos(periodo, treinos);
        if (candidatos.isEmpty()) {
            throw erro("Não existe nenhum horário livre entre acordar, dormir e treinar");
        }

        for (int quantidade = desejadas; quantidade >= 1; quantidade--) {
            for (int intervalo : new int[] {90, 75, 60, 45}) {
                List<LocalDateTime> horarios = escolherHorarios(
                        candidatos, periodo, treinos, quantidade, intervalo);
                if (!horarios.isEmpty()) return horarios;
            }
        }
        throw erro("Não foi possível encontrar horários de alimentação");
    }

    private List<String> nomesRefeicoes(int quantidade) {
        return switch (quantidade) {
            case 1 -> List.of("Refeição principal");
            case 2 -> List.of("Café da manhã", "Jantar");
            case 3 -> List.of("Café da manhã", "Almoço", "Jantar");
            case 4 -> List.of("Café da manhã", "Almoço", "Lanche da tarde", "Jantar");
            case 5 -> List.of("Café da manhã", "Lanche da manhã", "Almoço",
                    "Lanche da tarde", "Jantar");
            case 6 -> List.of("Café da manhã", "Lanche da manhã", "Almoço",
                    "Lanche da tarde", "Jantar", "Ceia");
            default -> List.of("Café da manhã", "Lanche da manhã", "Almoço",
                    "Lanche intermediário", "Lanche da tarde", "Jantar", "Ceia");
        };
    }

    private String adaptarNomeAoTreino(String nome, LocalDateTime horario,
                                      List<Bloqueio> treinos) {
        if (!nome.contains("Lanche") && !nome.equals("Ceia")) return nome;
        for (Bloqueio treino : treinos) {
            long antes = Duration.between(horario, treino.inicio()).toMinutes();
            if (antes >= 30 && antes <= 120) return "Lanche pré-treino";
            long depois = Duration.between(treino.fim(), horario).toMinutes();
            if (depois >= 0 && depois <= 120) return "Lanche pós-treino";
        }
        return nome;
    }

    private double fatorQuantidade(RotinaResposeUsuario rotina, int idade, double imc) {
        double fator = 1.0;
        String objetivo = rotina.objetivo().name();
        if (objetivo.contains("GANHO")) fator *= 1.10;
        if (objetivo.contains("PERDA") || objetivo.contains("EMAGREC")) fator *= 0.95;
        if (idade >= 18) {
            if (imc < 18.5) fator *= 1.05;
            if (imc >= 30) fator *= 0.95;
        }
        return Math.max(0.90, Math.min(1.15, fator));
    }

    private String normalizarNome(String nome) {
        return Normalizer.normalize(nome.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }

    private boolean contem(String texto, String... palavras) {
        for (String palavra : palavras) if (texto.contains(palavra)) return true;
        return false;
    }

    private BigDecimal calcularQuantidade(String nomeAlimento, double fator) {
        String nome = normalizarNome(nomeAlimento);
        int quantidadeBase;
        if (contem(nome, "azeite", "oleo", "manteiga")) quantidadeBase = 10;
        else if (contem(nome, "castanha", "nozes", "amendoim")) quantidadeBase = 25;
        else if (contem(nome, "pao", "torrada")) quantidadeBase = 60;
        else if (contem(nome, "frango", "carne", "peixe", "ovo", "tofu")) quantidadeBase = 120;
        else if (contem(nome, "arroz", "batata", "macarrao", "feijao", "mandioca", "aveia")) quantidadeBase = 100;
        else if (contem(nome, "leite", "iogurte")) quantidadeBase = 150;
        else if (contem(nome, "banana", "maca", "mamao", "laranja", "melancia", "fruta")) quantidadeBase = 100;
        else quantidadeBase = 80;

        return BigDecimal.valueOf(quantidadeBase)
                .multiply(BigDecimal.valueOf(fator))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private int pontuacaoAlimento(String nomeAlimento, String nomeRefeicao) {
        String nome = normalizarNome(nomeAlimento);
        String refeicao = normalizarNome(nomeRefeicao);
        boolean principal = refeicao.equals("almoco") || refeicao.equals("jantar")
                || refeicao.equals("refeicao principal");

        if (principal) {
            if (contem(nome, "frango", "carne", "peixe", "ovo", "tofu")) return 4;
            if (contem(nome, "arroz", "feijao", "batata", "macarrao", "mandioca")) return 3;
            if (contem(nome, "salada", "alface", "brocolis", "cenoura", "tomate")) return 2;
        } else {
            if (contem(nome, "banana", "maca", "mamao", "laranja", "fruta",
                    "iogurte", "leite")) return 4;
            if (contem(nome, "pao", "aveia", "ovo")) return 3;
        }
        return 1;
    }
    private List<ItemSelecionadoResponse> selecionarAlimentos(
            List<ItemSelecionadoResponse> favoritos,
            String nomeRefeicao,
            int semente,
            Set<String> usadosNoPeriodo,
            Map<String, Integer> usoSemanal) {

        List<ItemSelecionadoResponse> candidatos = new ArrayList<>(favoritos);
        Collections.rotate(candidatos, Math.floorMod(semente, candidatos.size()));

        candidatos.sort(Comparator.comparingInt((ItemSelecionadoResponse a) ->
                pontuacaoAlimento(a.nome(), nomeRefeicao) * 5
                        + (usadosNoPeriodo.contains(a.id()) ? 0 : 30)
                        - usoSemanal.getOrDefault(a.id(), 0) * 4).reversed());

        boolean principal = nomeRefeicao.equals("Almoço") || nomeRefeicao.equals("Jantar")
                || nomeRefeicao.equals("Refeição principal");
        int desejados = principal ? (favoritos.size() >= 16 ? 5 : favoritos.size() >= 8 ? 4 : 3)
                : (favoritos.size() >= 8 ? 3 : 2);
        int quantidade = Math.min(desejados, candidatos.size());

        List<ItemSelecionadoResponse> escolhidos = new ArrayList<>(candidatos.subList(0, quantidade));
        for (ItemSelecionadoResponse alimento : escolhidos) {
            usadosNoPeriodo.add(alimento.id());
            usoSemanal.merge(alimento.id(), 1, Integer::sum);
        }
        return escolhidos;
    }

    private List<RotinaResposeUsuario.RefeicaoResponse> gerarRefeicoes(
            RotinaResposeUsuario rotina, int idade, double imc) {
        List<PeriodoAcordado> periodos = construirPeriodosAcordados(rotina);
        List<Bloqueio> treinos = construirBloqueiosTreino(rotina);
        double fator = fatorQuantidade(rotina, idade, imc);

        Map<String, ItemSelecionadoResponse> porId = new LinkedHashMap<>();
        for (ItemSelecionadoResponse alimento : rotina.alimentosPreferidos()) {
            porId.putIfAbsent(alimento.id(), alimento);
        }
        List<ItemSelecionadoResponse> favoritos = new ArrayList<>(porId.values());

        Map<String, Integer> usoSemanal = new HashMap<>();
        List<RotinaResposeUsuario.RefeicaoResponse> resultado = new ArrayList<>();
        LocalDateTime inicioSemana = SEGUNDA_BASE.atStartOfDay();
        LocalDateTime fimSemana = SEGUNDA_BASE.plusDays(7).atStartOfDay();

        for (int dia = 0; dia < periodos.size(); dia++) {
            PeriodoAcordado periodo = periodos.get(dia);
            int quantidade = definirQuantidadeRefeicoes(rotina, periodo, treinos, favoritos.size());
            List<LocalDateTime> horarios = distribuirHorarios(periodo, treinos, quantidade);
            List<String> nomes = nomesRefeicoes(horarios.size());
            Set<String> usadosNoPeriodo = new HashSet<>();

            for (int i = 0; i < horarios.size(); i++) {
                LocalDateTime horarioCompleto = horarios.get(i);
                String nomeBase = nomes.get(i);
                String nome = adaptarNomeAoTreino(nomeBase, horarioCompleto, treinos);

                List<ItemSelecionadoResponse> selecionados = selecionarAlimentos(
                        favoritos, nomeBase, (dia * 7) + (i * 3),
                        usadosNoPeriodo, usoSemanal);
                if (horarioCompleto.isBefore(inicioSemana)
                        || !horarioCompleto.isBefore(fimSemana)) continue;

                List<RotinaResposeUsuario.RefeicaoAlimentoResponse> alimentos = new ArrayList<>();
                for (ItemSelecionadoResponse alimento : selecionados) {
                    alimentos.add(new RotinaResposeUsuario.RefeicaoAlimentoResponse(
                            alimento.id(), alimento.nome(),
                            calcularQuantidade(alimento.nome(), fator)));
                }

                long diasDaBase = Duration.between(
                        inicioSemana, horarioCompleto.toLocalDate().atStartOfDay()).toDays();
                Dia_semana diaSemana = Dia_semana.valueOf(
                        ORDEM_DIAS.get(Math.floorMod((int) diasDaBase, 7)));

                resultado.add(new RotinaResposeUsuario.RefeicaoResponse(
                        UUID.randomUUID().toString(), diaSemana, nome,
                        horarioCompleto.toLocalTime(), alimentos));
            }
        }

        resultado.sort(Comparator
                .comparingInt((RotinaResposeUsuario.RefeicaoResponse r) -> indiceDia(r.diaSemana()))
                .thenComparing(RotinaResposeUsuario.RefeicaoResponse::horario));
        return resultado;
    }
}
