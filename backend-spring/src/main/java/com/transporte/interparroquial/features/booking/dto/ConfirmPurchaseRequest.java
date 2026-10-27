package com.transporte.interparroquial.features.booking.dto;

import com.transporte.interparroquial.features.booking.entity.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPurchaseRequest {

    @NotNull(message = "El ID del horario es obligatorio")
    private UUID scheduleId;

    private UUID userId; // Opcional si el usuario no tiene cuenta creada

    @NotNull(message = "El número de asiento es obligatorio")
    @Min(1) @Max(40)
    private Integer seatNumber;

    @NotNull(message = "La parada de origen es obligatoria")
    private Long originStopId;

    @NotNull(message = "La parada de destino es obligatoria")
    private Long destinationStopId;

    @NotNull(message = "El orden de parada origen es obligatorio")
    private Integer originOrder;

    @NotNull(message = "El orden de parada destino es obligatorio")
    private Integer destOrder;

    @NotBlank(message = "El nombre del pasajero es obligatorio")
    private String passengerName;

    @NotBlank(message = "La cédula del pasajero es obligatoria")
    private String passengerCedula;

    @NotBlank(message = "El teléfono celular es obligatorio")
    private String passengerPhone;

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    @Builder.Default
    private Boolean isSeniorCitizen = false;
}
