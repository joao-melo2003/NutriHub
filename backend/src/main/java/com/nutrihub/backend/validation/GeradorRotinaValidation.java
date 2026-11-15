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
            "SEGUNDA", "TERCA", "QUARTA", "QUINTA",
            "SEXTA", "SABADO", "DOMINGO");

    private record Bloqueio(
            LocalDateTime inicio,
            LocalDateTime fim) {
    }

    private record AlvoRefeicao(
            String nome,
            LocalTime horario) {
    }


    public RotinaResposeUsuario gerar(RotinaResposeUsuario rotina,LocalDate dataNascimento) {

        validarDados(rotina, dataNascimento);

        int idade = Period.between(
                dataNascimento,
                LocalDate.now()).getYears();

        double peso = rotina.peso().doubleValue();
        double altura = rotina.altura().doubleValue();

        double imc = peso / (altura * altura);

        List<RotinaResposeUsuario.TreinoResponse> treinos = gerarTreinos(rotina);

        List<RotinaResposeUsuario.RefeicaoResponse> refeicoes = gerarRefeicoes(rotina, idade, imc);

        return new RotinaResposeUsuario(
                rotina.idRotina(),
                rotina.objetivo(),
                rotina.peso(),
                rotina.altura(),
                rotina.divisao(),
                rotina.distribuicao(),
                rotina.preferenciasMusculares(),
                treinos,
                rotina.horariosSono(),
                rotina.restricoesAlimentares(),
                rotina.alimentosPreferidos(),
                refeicoes);
    }

    private void validarDados(
            RotinaResposeUsuario rotina,
            LocalDate nascimento) {

        if (rotina == null ||
                nascimento == null ||
                nascimento.isAfter(LocalDate.now()) ||
                rotina.peso() == null ||
                rotina.altura() == null ||
                rotina.objetivo() == null ||
                rotina.divisao() == null ||
                rotina.distribuicao() == null ||
                rotina.treinos() == null ||
                rotina.horariosSono() == null ||
                rotina.alimentosPreferidos() == null) {

            throw erro("Dados da rotina incompletos");
        }

        if (rotina.peso().signum() <= 0 ||
                rotina.altura().signum() <= 0 ||
                rotina.altura().doubleValue() > 3) {

            throw erro("Peso ou altura inválidos");
        }

        if (rotina.treinos().isEmpty() ||
                rotina.alimentosPreferidos().size() < 5 ||
                rotina.horariosSono().size() != 7) {

            throw erro("Treinos, alimentos ou sono incompletos");
        }

        Set<Dia_semana> diasSono = new HashSet<>();
        Set<Dia_semana> diasTreino = new HashSet<>();
        Set<String> idsAlimentos = new HashSet<>();

        for (var sono : rotina.horariosSono()) {

            if (sono == null ||
                    sono.diaSemana() == null ||
                    sono.horarioDormir() == null ||
                    sono.horarioAcordar() == null ||
                    sono.horarioDormir().equals(sono.horarioAcordar()) ||
                    !diasSono.add(sono.diaSemana())) {

                throw erro("Horários de sono inválidos");
            }

            indiceDia(sono.diaSemana());
        }

        for (var treino : rotina.treinos()) {

            if (treino == null ||
                    treino.diaSemana() == null ||
                    treino.horarioInicio() == null ||
                    treino.horarioFim() == null ||
                    treino.horarioInicio().equals(treino.horarioFim()) ||
                    !diasTreino.add(treino.diaSemana())) {

                throw erro("Dados dos treinos inválidos");
            }

            indiceDia(treino.diaSemana());
        }

        for (ItemSelecionadoResponse alimento : rotina.alimentosPreferidos()) {

            if (alimento == null ||
                    alimento.id() == null ||
                    alimento.id().isBlank() ||
                    alimento.nome() == null ||
                    alimento.nome().isBlank() ||
                    !idsAlimentos.add(alimento.id())) {

                throw erro("Alimentos favoritos inválidos ou repetidos");
            }
        }

        if (diasSono.size() != 7) {
            throw erro("Informe os sete dias de sono");
        }
    }

    private int indiceDia(Dia_semana dia) {

        int indice = ORDEM_DIAS.indexOf(dia.name());

        if (indice < 0) {
            throw erro("Dia da semana desconhecido");
        }

        return indice;
    }

    private ResponseStatusException erro(String mensagem) {

        return new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                mensagem);
    }

    private List<RotinaResposeUsuario.TreinoResponse> gerarTreinos(
            RotinaResposeUsuario rotina) {

        List<RotinaResposeUsuario.TreinoResponse> treinosOriginais = rotina.treinos().stream()
                .sorted(Comparator.comparingInt(
                        t -> indiceDia(t.diaSemana())))
                .toList();

        String divisao = rotina.divisao().name();

        boolean prioritario = "PRIORIDADE".equals(rotina.distribuicao().name());

        List<String> prioridades = List.of(
                "SUPERIORES",
                "INFERIORES",
                "ABDOMINAL");

        if (prioritario) {

            Map<String, Integer> mapa = rotina.preferenciasMusculares();

            if (mapa == null ||
                    !mapa.keySet().equals(Set.of(
                            "SUPERIORES", "INFERIORES", "ABDOMINAL"))
                    ||
                    !new HashSet<>(mapa.values()).equals(Set.of(1, 2, 3))) {

                throw erro("Prioridades musculares inválidas");
            }

            prioridades = mapa.entrySet().stream()
                    .sorted(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .toList();
        }

        List<RotinaResposeUsuario.TreinoResponse> resultado = new ArrayList<>();

        int quantidade = treinosOriginais.size();

        for (int i = 0; i < quantidade; i++) {

            var treino = treinosOriginais.get(i);

            String grupo = escolherGrupo(
                    divisao,
                    prioritario,
                    prioridades,
                    i,
                    quantidade);

            resultado.add(
                    new RotinaResposeUsuario.TreinoResponse(
                            treino.diaSemana(),
                            treino.horarioInicio(),
                            treino.horarioFim(),
                            grupo));
        }

        return resultado;
    }

    private String escolherGrupo(
            String divisao,
            boolean prioritario,
            List<String> prioridade,
            int indice,
            int quantidadeTreinos) {

        String superiores = "SUPERIORES";
        String inferiores = "INFERIORES";
        String abdominal = "ABDOMINAL";

        if (!prioritario) {

            List<String> sequencia = switch (divisao) {

                case "ABC" -> List.of(
                        superiores, inferiores, abdominal);

                case "FULL_BODY" -> List.of(
                        superiores, inferiores, abdominal);

                case "UPPER_LOWER" -> List.of(
                        superiores, inferiores);

                case "PUSH_PULL_LEGS" -> List.of(
                        superiores, superiores, inferiores);

                case "ABCDE" -> List.of(
                        superiores, superiores, inferiores,
                        abdominal, inferiores);

                default -> throw erro("Divisão de treino inválida");
            };

            return sequencia.get(indice % sequencia.size());
        }

        String primeiro = prioridade.get(0);
        String segundo = prioridade.get(1);
        String terceiro = prioridade.get(2);

        switch (divisao) {

            case "ABC", "FULL_BODY" -> {

                List<String> ciclo = List.of(
                        primeiro, segundo, terceiro,
                        primeiro, segundo, primeiro, terceiro);

                return ciclo.get(indice % ciclo.size());
            }

            case "UPPER_LOWER" -> {

                boolean inferioresPrimeiro = primeiro.equals(inferiores);

                String grupo = (indice % 2 == 0)
                        ? (inferioresPrimeiro ? inferiores : superiores)
                        : (inferioresPrimeiro ? superiores : inferiores);

                if (primeiro.equals(abdominal) &&
                        quantidadeTreinos >= 4 &&
                        indice == 3) {

                    return abdominal;
                }

                return grupo;
            }

            case "PUSH_PULL_LEGS" -> {

                List<String> ciclo = primeiro.equals(inferiores)
                        ? List.of(inferiores, superiores, superiores)
                        : List.of(superiores, superiores, inferiores);

                if (primeiro.equals(abdominal) &&
                        quantidadeTreinos >= 4 &&
                        indice == 3) {

                    return abdominal;
                }

                return ciclo.get(indice % ciclo.size());
            }

            case "ABCDE" -> {

                List<String> ciclo = List.of(
                        primeiro, segundo, primeiro,
                        terceiro, primeiro);

                return ciclo.get(indice % ciclo.size());
            }

            default -> throw erro("Divisão de treino inválida");
        }
    }

    private List<Bloqueio> construirBloqueios(
            RotinaResposeUsuario rotina) {

        List<Bloqueio> bloqueios = new ArrayList<>();

        for (int semana = -1; semana <= 1; semana++) {


            for (var sono : rotina.horariosSono()) {

                LocalDate data = SEGUNDA_BASE.plusDays(
                        indiceDia(sono.diaSemana()) + semana * 7L);

                LocalDateTime inicio = data.atTime(sono.horarioDormir());

                LocalDateTime fim = data.atTime(sono.horarioAcordar());

                if (!fim.isAfter(inicio)) {
                    fim = fim.plusDays(1);
                }

                bloqueios.add(new Bloqueio(inicio, fim));
            }

            for (var treino : rotina.treinos()) {

                LocalDate data = SEGUNDA_BASE.plusDays(
                        indiceDia(treino.diaSemana()) + semana * 7L);

                LocalDateTime inicio = data.atTime(treino.horarioInicio());

                LocalDateTime fim = data.atTime(treino.horarioFim());

                if (!fim.isAfter(inicio)) {
                    fim = fim.plusDays(1);
                }

                bloqueios.add(new Bloqueio(
                        inicio.minusMinutes(30),
                        fim.plusMinutes(30)));
            }
        }

        return bloqueios;
    }

    private LocalTime encontrarHorario(
            int indiceDia,
            LocalTime horarioIdeal,
            List<Bloqueio> bloqueios,
            List<LocalTime> horariosUsados) {

        LocalDate data = SEGUNDA_BASE.plusDays(indiceDia);

        int minutosIdeais = horarioIdeal.toSecondOfDay() / 60;

        for (int distancia = 0; distancia <= 10; distancia++) {

            for (int sinal : new int[] { -1, 1 }) {

                if (distancia == 0 && sinal == 1) {
                    continue;
                }

                int minutos = minutosIdeais +
                        sinal * distancia * 30;

                if (minutos < 0 || minutos >= 1440) {
                    continue;
                }

                LocalTime horario = LocalTime.ofSecondOfDay(minutos * 60L);

                LocalDateTime candidato = data.atTime(horario);

                boolean ocupado = bloqueios.stream().anyMatch(b -> !candidato.isBefore(b.inicio()) &&
                        candidato.isBefore(b.fim()));

                if (ocupado) {
                    continue;
                }

                boolean muitoProximo = horariosUsados.stream()
                        .anyMatch(h -> Math.abs(
                                Duration.between(h, horario).toMinutes()) < 90);

                if (muitoProximo) {
                    continue;
                }

                return horario;
            }
        }

        throw erro(
                "Não foi possível distribuir as refeições " +
                        "nos horários disponíveis");
    }

    private double fatorQuantidade(
            RotinaResposeUsuario rotina,
            int idade,
            double imc) {

        double fator = 1.0;

        String objetivo = rotina.objetivo().name();

        if (objetivo.contains("GANHO")) {
            fator *= 1.10;
        }

        if (objetivo.contains("PERDA") ||
                objetivo.contains("EMAGREC")) {
            fator *= 0.95;
        }

        if (idade >= 18) {

            if (imc < 18.5) {
                fator *= 1.05;
            }

            if (imc >= 30) {
                fator *= 0.95;
            }
        }

        return Math.max(0.90, Math.min(1.15, fator));
    }

    private String normalizarNome(String nome) {

        return Normalizer.normalize(
                nome.toLowerCase(Locale.ROOT),
                Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }

    private boolean contem(String texto, String... palavras) {

        for (String palavra : palavras) {
            if (texto.contains(palavra)) {
                return true;
            }
        }

        return false;
    }

    private BigDecimal calcularQuantidade(
            String nomeAlimento,
            double fator) {

        String nome = normalizarNome(nomeAlimento);

        int quantidadeBase;

        if (contem(nome, "azeite", "oleo", "manteiga")) {
            quantidadeBase = 10;

        } else if (contem(nome, "castanha", "nozes", "amendoim")) {
            quantidadeBase = 25;

        } else if (contem(nome, "pao", "torrada")) {
            quantidadeBase = 60;

        } else if (contem(nome,
                "frango", "carne", "peixe", "ovo", "tofu")) {
            quantidadeBase = 120;

        } else if (contem(nome,
                "arroz", "batata", "macarrao",
                "feijao", "mandioca", "aveia")) {
            quantidadeBase = 100;

        } else if (contem(nome, "leite", "iogurte")) {
            quantidadeBase = 150;

        } else if (contem(nome,
                "banana", "maca", "mamao", "laranja",
                "melancia", "fruta")) {
            quantidadeBase = 100;

        } else {
            quantidadeBase = 80;
        }

        return BigDecimal.valueOf(quantidadeBase)
                .multiply(BigDecimal.valueOf(fator))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private int pontuacaoAlimento(
            String nomeAlimento,
            String nomeRefeicao) {

        String nome = normalizarNome(nomeAlimento);
        String refeicao = normalizarNome(nomeRefeicao);

        boolean principal = refeicao.equals("almoco") ||
                refeicao.equals("jantar");

        if (principal) {

            if (contem(nome,
                    "frango", "carne", "peixe", "ovo", "tofu")) {
                return 4;
            }

            if (contem(nome,
                    "arroz", "feijao", "batata",
                    "macarrao", "mandioca")) {
                return 3;
            }

            if (contem(nome,
                    "salada", "alface", "brocolis",
                    "cenoura", "tomate")) {
                return 2;
            }

        } else {

            if (contem(nome,
                    "banana", "maca", "mamao", "laranja",
                    "fruta", "iogurte", "leite")) {
                return 4;
            }

            if (contem(nome, "pao", "aveia", "ovo")) {
                return 3;
            }
        }

        return 1;
    }

    private List<ItemSelecionadoResponse> selecionarAlimentos(
            List<ItemSelecionadoResponse> favoritos,
            String nomeRefeicao,
            int semente) {

        List<ItemSelecionadoResponse> candidatos = new ArrayList<>(favoritos);

        Collections.rotate(
                candidatos,
                -(semente % candidatos.size()));

        candidatos.sort(
                Comparator.comparingInt(
                        (ItemSelecionadoResponse alimento) -> pontuacaoAlimento(
                                alimento.nome(),
                                nomeRefeicao))
                        .reversed());

        boolean principal = nomeRefeicao.equals("Almoço") ||
                nomeRefeicao.equals("Jantar");

        int quantidade = principal ? 3 : 2;

        return candidatos.subList(
                0,
                Math.min(quantidade, candidatos.size()));
    }

    private List<RotinaResposeUsuario.RefeicaoResponse> gerarRefeicoes(
            RotinaResposeUsuario rotina,
            int idade,
            double imc) {

        List<Bloqueio> bloqueios = construirBloqueios(rotina);

        double fator = fatorQuantidade(rotina, idade, imc);

        List<AlvoRefeicao> alvos = new ArrayList<>();

        alvos.add(new AlvoRefeicao(
                "Café da manhã",
                LocalTime.of(7, 30)));

        if (rotina.objetivo().name().contains("GANHO") ||
                idade >= 60) {

            alvos.add(new AlvoRefeicao(
                    "Lanche da manhã",
                    LocalTime.of(10, 30)));
        }

        alvos.add(new AlvoRefeicao(
                "Almoço",
                LocalTime.of(12, 30)));

        alvos.add(new AlvoRefeicao(
                "Lanche da tarde",
                LocalTime.of(16, 0)));

        alvos.add(new AlvoRefeicao(
                "Jantar",
                LocalTime.of(19, 30)));

        List<RotinaResposeUsuario.RefeicaoResponse> resultado = new ArrayList<>();

        for (int dia = 0; dia < 7; dia++) {

            List<LocalTime> horariosUsados = new ArrayList<>();

            Dia_semana diaSemana = Dia_semana.valueOf(
                    ORDEM_DIAS.get(dia));

            for (int i = 0; i < alvos.size(); i++) {

                AlvoRefeicao alvo = alvos.get(i);

                LocalTime horario = encontrarHorario(
                        dia,
                        alvo.horario(),
                        bloqueios,
                        horariosUsados);

                horariosUsados.add(horario);

                List<ItemSelecionadoResponse> selecionados = selecionarAlimentos(
                        rotina.alimentosPreferidos(),
                        alvo.nome(),
                        dia * 3 + i * 2);

                List<RotinaResposeUsuario.RefeicaoAlimentoResponse> alimentos = new ArrayList<>();

                for (ItemSelecionadoResponse alimento : selecionados) {

                    BigDecimal quantidade = calcularQuantidade(
                            alimento.nome(),
                            fator);

                    alimentos.add(
                            new RotinaResposeUsuario.RefeicaoAlimentoResponse(
                                    alimento.id(),
                                    alimento.nome(),
                                    quantidade));
                }

                resultado.add(
                        new RotinaResposeUsuario.RefeicaoResponse(
                                UUID.randomUUID().toString(),
                                diaSemana,
                                alvo.nome(),
                                horario,
                                alimentos));
            }
        }

        resultado.sort(
                Comparator
                        .comparingInt(
                                (RotinaResposeUsuario.RefeicaoResponse r) -> indiceDia(r.diaSemana()))
                        .thenComparing(
                                RotinaResposeUsuario.RefeicaoResponse::horario));

        return resultado;
    }
}