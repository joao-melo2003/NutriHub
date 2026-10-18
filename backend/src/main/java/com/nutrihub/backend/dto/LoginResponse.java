package com.nutrihub.backend.dto;

import java.time.Instant;

public record LoginResponse(
    String accessToken,
    String tokenType,
    Instant expiresAt
) {}