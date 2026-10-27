package com.transporte.interparroquial.features.boarding.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardingActionRequest {

    @NotBlank(message = "El código o hash del QR es obligatorio")
    private String qrCodeHash;

    private String controllerNotes;
}
