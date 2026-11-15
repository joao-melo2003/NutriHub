package com.nutrihub.backend.dto;

import java.util.List;

public record RotinaUpdateForms3Response(

    Boolean horariosIguais,
    List<HorarioSonoItemRequest> horarios

) {}