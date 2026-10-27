package com.transporte.interparroquial.features.boarding.controller;

import com.transporte.interparroquial.features.boarding.dto.BoardingActionRequest;
import com.transporte.interparroquial.features.boarding.dto.ScanQrResponse;
import com.transporte.interparroquial.features.boarding.service.BoardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/boarding")
@RequiredArgsConstructor
public class BoardingController {

    private final BoardingService boardingService;

    @GetMapping("/scan-qr/{qrHash}")
    public ResponseEntity<ScanQrResponse> scanQr(@PathVariable String qrHash) {
        ScanQrResponse response = boardingService.scanQr(qrHash);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm-cash-and-board")
    public ResponseEntity<ScanQrResponse> confirmCashAndBoard(@Valid @RequestBody BoardingActionRequest request) {
        ScanQrResponse response = boardingService.confirmCashAndBoard(request.getQrCodeHash());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm-boarding")
    public ResponseEntity<ScanQrResponse> confirmBoarding(@Valid @RequestBody BoardingActionRequest request) {
        ScanQrResponse response = boardingService.confirmBoarding(request.getQrCodeHash());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cleanup-expired")
    public ResponseEntity<Map<String, Object>> triggerManualCleanup() {
        int count = boardingService.cancelExpiredPendingCashTickets();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "cancelledCount", count,
                "message", count + " reservas en efectivo expiradas fueron canceladas y sus asientos liberados."
        ));
    }
}
