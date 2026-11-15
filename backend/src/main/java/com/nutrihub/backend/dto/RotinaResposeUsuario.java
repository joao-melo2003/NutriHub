package com.nutrihub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import com.nutrihub.backend.enums.*;

public record RotinaResposeUsuario(

    String idRotina,

    Objetivo_rotina objetivo,

    BigDecimal peso,

    BigDecimal altura,

    Divisao_rotina divisao,

    Distribuicao_rotina distribuicao,

    Map<String, Integer> preferenciasMusculares,

    List<TreinoResponse> treinos,

    List<SonoResponse> horariosSono,

    List<ItemSelecionadoResponse> restricoesAlimentares,

    List<ItemSelecionadoResponse> alimentosPreferidos,

    List<RefeicaoResponse> refeicoes

) {

    public record TreinoResponse(

        Dia_semana diaSemana,

        LocalTime horarioInicio,

        LocalTime horarioFim,

        String grupoMuscular

    ) {}

    public record SonoResponse(

        Dia_semana diaSemana,

        LocalTime horarioDormir,

        LocalTime horarioAcordar

    ) {}

    public record RefeicaoResponse(

        String id,

        Dia_semana diaSemana,

        String nome,

        LocalTime horario,

        List<RefeicaoAlimentoResponse> alimentos

    ) {}

    public record RefeicaoAlimentoResponse(

        String idAlimento,

        String nome,

        BigDecimal quantidade

    ) {}
}