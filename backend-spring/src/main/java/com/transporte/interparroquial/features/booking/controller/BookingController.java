package com.transporte.interparroquial.features.booking.controller;

import com.transporte.interparroquial.features.booking.dto.ConfirmPurchaseRequest;
import com.transporte.interparroquial.features.booking.dto.LockSeatRequest;
import com.transporte.interparroquial.features.booking.dto.LockSeatResponse;
import com.transporte.interparroquial.features.booking.dto.SeatAvailabilityResponse;
import com.transporte.interparroquial.features.booking.dto.TicketResponse;
import com.transporte.interparroquial.features.booking.service.BookingService;
import com.transporte.interparroquial.features.booking.service.SeatAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final SeatAvailabilityService seatAvailabilityService;

    @PostMapping("/lock-seat")
    public ResponseEntity<LockSeatResponse> lockSeat(@Valid @RequestBody LockSeatRequest request) {
        LockSeatResponse response = bookingService.lockSeat(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    @PostMapping({"/confirm-purchase", "/create-ticket"})
    public ResponseEntity<TicketResponse> confirmPurchase(@Valid @RequestBody ConfirmPurchaseRequest request) {
        TicketResponse response = bookingService.confirmPurchase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/availability")
    public ResponseEntity<SeatAvailabilityResponse> getSeatAvailability(
            @RequestParam UUID scheduleId,
            @RequestParam int originOrder,
            @RequestParam int destOrder) {
        SeatAvailabilityResponse response = seatAvailabilityService.getScheduleAvailability(scheduleId, originOrder, destOrder);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/schedules/{scheduleId}/seat-availability")
    public ResponseEntity<SeatAvailabilityResponse> getSeatAvailabilityBySchedule(
            @PathVariable UUID scheduleId,
            @RequestParam int originOrder,
            @RequestParam int destOrder) {
        SeatAvailabilityResponse response = seatAvailabilityService.getScheduleAvailability(scheduleId, originOrder, destOrder);
        return ResponseEntity.ok(response);
    }
}
