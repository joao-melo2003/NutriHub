package com.nutrihub.backend.dto;

public record ApiErrorResponse(
    int status,
    String message
) {}