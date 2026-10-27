package com.transporte.interparroquial.features.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "schedules", indexes = {
    @Index(name = "idx_schedule_departure", columnList = "departureTime")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String busNumber; // Ej: "Disco 08 - Ciudad Blanca"

    @Column(nullable = false, length = 100)
    private String cooperativeName; // Ej: "Transportes Unidos"

    @Column(nullable = false, length = 20)
    private String plate; // Ej: "IAA-3341"

    @Column(nullable = false)
    private LocalTime departureTime; // Ej: 06:15, 07:30, 09:00

    @Column(nullable = false)
    private LocalTime estimatedArrivalTime;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalSeats = 40; // Capacidad estándar fija de 40 asientos

    @Column(length = 100)
    private String driverName;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
