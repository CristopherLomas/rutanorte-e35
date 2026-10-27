package com.transporte.interparroquial.features.auth.dto;

import com.transporte.interparroquial.features.auth.entity.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private UUID userId;
    private String cedula;
    private String fullName;
    private String email;
    private RoleEnum role;
    private Boolean isPreferential;
    private String message;
}
