package com.transporte.interparroquial.features.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets", indexes = {
    @Index(name = "idx_ticket_schedule", columnList = "scheduleId"),
    @Index(name = "idx_ticket_qr", columnList = "qrCodeHash", unique = true),
    @Index(name = "idx_ticket_status", columnList = "status"),
    @Index(name = "idx_ticket_seat_schedule", columnList = "scheduleId, seatNumber")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID scheduleId;

    @Column
    private UUID userId; // Opcional (compra anónima en kiosco o vinculada a cuenta)

    @Column(nullable = false)
    private Integer seatNumber; // 1 al 40

    @Column(nullable = false)
    private Long originStopId;

    @Column(nullable = false)
    private Long destinationStopId;

    @Column(nullable = false)
    private Integer originOrder; // 1 al 8

    @Column(nullable = false)
    private Integer destOrder; // 1 al 8

    @Column(nullable = false, length = 150)
    private String passengerName;

    @Column(nullable = false, length = 13)
    private String passengerCedula;

    @Column(nullable = false, length = 20)
    private String passengerPhone;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountApplied = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TicketStatus status;

    @Column(nullable = false, unique = true, length = 100)
    private String qrCodeHash;

    @Column
    private LocalDateTime boardedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
