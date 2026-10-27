package com.transporte.interparroquial.features.booking.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LockSeatRequest {

    @NotNull(message = "El ID del horario/viaje es obligatorio")
    private UUID scheduleId;

    @NotNull(message = "El número de asiento es obligatorio")
    @Min(value = 1, message = "El asiento mínimo es 1")
    @Max(value = 40, message = "El autobús tiene un máximo de 40 asientos")
    private Integer seatNumber;

    @NotNull(message = "La parada de origen es obligatoria")
    private Long originStopId;

    @NotNull(message = "La parada de destino es obligatoria")
    private Long destinationStopId;

    @NotNull(message = "El orden de origen es obligatorio")
    private Integer originOrder;

    @NotNull(message = "El orden de destino es obligatorio")
    private Integer destOrder;

    private String clientSessionId;
}
