package com.transporte.interparroquial.features.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "El correo o cédula es obligatorio")
    private String identifier;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
