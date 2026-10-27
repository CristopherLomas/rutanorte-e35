package com.transporte.interparroquial.features.boarding.dto;

import com.transporte.interparroquial.features.booking.entity.PaymentMethod;
import com.transporte.interparroquial.features.booking.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanQrResponse {
    private UUID ticketId;
    private String qrCodeHash;
    private String passengerName;
    private String passengerCedula;
    private Integer seatNumber;
    private String originStopName;
    private String destinationStopName;
    private Integer originOrder;
    private Integer destOrder;
    private String departureTime;
    private String busNumber;
    private String cooperativeName;
    private BigDecimal amountUSD;
    private PaymentMethod paymentMethod;
    private TicketStatus status;
    private boolean isBoarded;
    private LocalDateTime boardedAt;
    private boolean isActionRequired; // True si requiere cobro en efectivo
    private String verificationMessage;
}
