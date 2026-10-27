package com.transporte.interparroquial.features.routes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareCalculationResponse {
    private Long originStopId;
    private String originStopName;
    private Long destinationStopId;
    private String destinationStopName;
    private Double distanceKm;
    private String formattedDuration;
    private Integer estimatedMinutes;
    private BigDecimal basePrice;
    private BigDecimal discountApplied;
    private BigDecimal finalPrice;
    private Boolean isSeniorDiscountApplied;
    private List<String> intermediateStops;
}
