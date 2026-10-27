package com.transporte.interparroquial.features.routes.service;

import com.transporte.interparroquial.features.routes.dto.FareCalculationResponse;
import com.transporte.interparroquial.features.routes.dto.StopDto;
import com.transporte.interparroquial.features.routes.entity.StopEntity;
import com.transporte.interparroquial.features.routes.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final StopRepository stopRepository;

    @Value("${app.booking.base-fare-per-km:0.04}")
    private double baseFarePerKm;

    @Value("${app.booking.minimum-fare:0.75}")
    private double minimumFare;

    @Transactional(readOnly = true)
    public List<StopDto> getAllStops() {
        return stopRepository.findAllByOrderByStopOrderAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FareCalculationResponse calculateFare(Long originId, Long destinationId, boolean isSeniorCitizen) {
        StopEntity origin = stopRepository.findById(originId)
                .orElseThrow(() -> new IllegalArgumentException("Parada de origen no encontrada con id: " + originId));
        StopEntity destination = stopRepository.findById(destinationId)
                .orElseThrow(() -> new IllegalArgumentException("Parada de destino no encontrada con id: " + destinationId));

        if (origin.getStopOrder() >= destination.getStopOrder()) {
            throw new IllegalArgumentException("La ruta debe tener sentido Norte a Sur por la Panamericana E35 (el destino debe ser posterior al origen).");
        }

        double distanceKm = Math.abs(destination.getKmFromStart() - origin.getKmFromStart());
        distanceKm = Math.round(distanceKm * 10.0) / 10.0;

        // Lista de paradas intermedias
        List<StopEntity> allStops = stopRepository.findAllByOrderByStopOrderAsc();
        List<String> intermediateStops = allStops.stream()
                .filter(s -> s.getStopOrder() > origin.getStopOrder() && s.getStopOrder() < destination.getStopOrder())
                .map(StopEntity::getName)
                .collect(Collectors.toList());

        // Tiempo estimado: 1 min/km + 5 min por parada intermedia
        int estimatedMinutes = (int) Math.round(distanceKm * 1.0) + (intermediateStops.size() * 5);
        estimatedMinutes = Math.max(10, estimatedMinutes);
        int hours = estimatedMinutes / 60;
        int mins = estimatedMinutes % 60;
        String formattedDuration = hours > 0 ? String.format("%dh %02dm", hours, mins) : String.format("%d min", mins);

        // Tarifa Base: $0.04/km con piso mínimo de $0.75
        double rawBaseFare = Math.max(minimumFare, distanceKm * baseFarePerKm);
        BigDecimal basePrice = BigDecimal.valueOf(rawBaseFare).setScale(2, RoundingMode.HALF_UP);

        // Descuento Ley Tercera Edad / Conadis (50%)
        BigDecimal discountApplied = BigDecimal.ZERO;
        BigDecimal finalPrice = basePrice;

        if (isSeniorCitizen) {
            discountApplied = basePrice.multiply(BigDecimal.valueOf(0.50)).setScale(2, RoundingMode.HALF_UP);
            finalPrice = basePrice.subtract(discountApplied).setScale(2, RoundingMode.HALF_UP);
        }

        return FareCalculationResponse.builder()
                .originStopId(origin.getId())
                .originStopName(origin.getName())
                .destinationStopId(destination.getId())
                .destinationStopName(destination.getName())
                .distanceKm(distanceKm)
                .formattedDuration(formattedDuration)
                .estimatedMinutes(estimatedMinutes)
                .basePrice(basePrice)
                .discountApplied(discountApplied)
                .finalPrice(finalPrice)
                .isSeniorDiscountApplied(isSeniorCitizen)
                .intermediateStops(intermediateStops)
                .build();
    }

    private StopDto mapToDto(StopEntity entity) {
        return StopDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .province(entity.getProvince())
                .stopOrder(entity.getStopOrder())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .kmFromStart(entity.getKmFromStart())
                .imageUrl(entity.getImageUrl())
                .description(entity.getDescription())
                .build();
    }
}
