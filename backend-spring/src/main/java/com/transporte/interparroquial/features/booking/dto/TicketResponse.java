package com.transporte.interparroquial.features.booking.dto;

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
public class TicketResponse {
    private UUID id;
    private String ticketCode;
    private String qrCodeHash;
    private String qrPayloadJson;
    private String passengerName;
    private String passengerCedula;
    private String passengerPhone;
    private Integer seatNumber;
    private String cooperativeName;
    private String busNumber;
    private String plate;
    private String departureTime;
    private String originName;
    private String destinationName;
    private BigDecimal basePrice;
    private BigDecimal discountApplied;
    private BigDecimal finalPrice;
    private PaymentMethod paymentMethod;
    private TicketStatus status;
    private Boolean isPreferential;
    private LocalDateTime createdAt;
    private String message;
}
