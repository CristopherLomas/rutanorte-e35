package com.transporte.interparroquial.features.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LockSeatResponse {
    private boolean success;
    private String lockKey;
    private UUID scheduleId;
    private Integer seatNumber;
    private long ttlSeconds;
    private LocalDateTime expiresAt;
    private String message;
}
