package com.rookies5.Backend_MATE.dto.response;

/**
 * Keeps the browser-only refresh token out of the JSON response while allowing
 * the controller to place it in an HttpOnly cookie.
 */
public record AuthSessionDto(AuthResponseDto response, String refreshToken) {
}
