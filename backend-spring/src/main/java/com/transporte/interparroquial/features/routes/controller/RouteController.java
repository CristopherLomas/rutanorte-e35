package com.transporte.interparroquial.features.routes.controller;

import com.transporte.interparroquial.features.routes.dto.FareCalculationResponse;
import com.transporte.interparroquial.features.routes.dto.StopDto;
import com.transporte.interparroquial.features.routes.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping("/stops")
    public ResponseEntity<List<StopDto>> getStops() {
        return ResponseEntity.ok(routeService.getAllStops());
    }

    @GetMapping("/calculate-fare")
    public ResponseEntity<FareCalculationResponse> calculateFare(
            @RequestParam Long originId,
            @RequestParam Long destinationId,
            @RequestParam(defaultValue = "false") boolean isSeniorCitizen) {
        return ResponseEntity.ok(routeService.calculateFare(originId, destinationId, isSeniorCitizen));
    }
}
