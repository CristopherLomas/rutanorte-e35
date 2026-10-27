package com.transporte.interparroquial.features.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatAvailabilityResponse {

    private UUID scheduleId;
    private String departureTime;
    private Integer requestedOriginOrder;
    private Integer requestedDestOrder;
    private Integer totalSeats;
    private Integer availableCount;
    private Integer occupiedCount;
    private List<SeatDetailDto> seats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatDetailDto {
        private Integer seatNumber;
        private boolean isAvailable;
        private String status; // "AVAILABLE", "LOCKED_TEMPORARY", "OCCUPIED_PAID", "OCCUPIED_PENDING_CASH", "OTHER_SEGMENT"
        private String passengerName;
        private String occupiedSegment;
    }
}
