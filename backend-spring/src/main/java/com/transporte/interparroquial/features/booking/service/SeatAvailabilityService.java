package com.transporte.interparroquial.features.booking.service;

import com.transporte.interparroquial.features.booking.dto.SeatAvailabilityResponse;
import com.transporte.interparroquial.features.booking.entity.ScheduleEntity;
import com.transporte.interparroquial.features.booking.entity.TicketEntity;
import com.transporte.interparroquial.features.booking.repository.ScheduleRepository;
import com.transporte.interparroquial.features.booking.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SeatAvailabilityService {

    private final TicketRepository ticketRepository;
    private final ScheduleRepository scheduleRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Algoritmo de Reutilización de Asientos por Tramos:
     * El corredor Tulcán - Ibarra corre de Norte a Sur (stopOrder 1 a 8).
     * Dos tramos colisionan si:
     * max(newOrigin, existingOrigin) < min(newDest, existingDest)
     * lo cual equivale a:
     * newOrigin < existingDest && newDest > existingOrigin
     */
    public boolean isOverlap(int originA, int destA, int originB, int destB) {
        return Math.max(originA, originB) < Math.min(destA, destB);
    }

    @Transactional(readOnly = true)
    public boolean isSeatAvailable(UUID scheduleId, int seatNumber, int originOrder, int destOrder) {
        if (originOrder >= destOrder) {
            return false;
        }

        // 1. Verificar boletos activos en Base de Datos (PAID o PENDING_CASH)
        List<TicketEntity> activeTickets = ticketRepository.findActiveTicketsForSchedule(scheduleId);
        boolean collisionWithTicket = activeTickets.stream()
                .filter(t -> t.getSeatNumber().equals(seatNumber))
                .anyMatch(t -> isOverlap(originOrder, destOrder, t.getOriginOrder(), t.getDestOrder()));

        if (collisionWithTicket) {
            return false;
        }

        // 2. Verificar bloqueos distribuidos temporales activos en Redis (TTL 5 min)
        String lockPattern = "lock:schedule:" + scheduleId + ":seat:" + seatNumber + ":tramo:*";
        Set<String> keys = redisTemplate.keys(lockPattern);

        if (keys != null && !keys.isEmpty()) {
            for (String key : keys) {
                // Parse tramo {origin}-{dest} from key
                // format: lock:schedule:{id}:seat:{num}:tramo:{origin}-{dest}
                String[] parts = key.split(":tramo:");
                if (parts.length == 2) {
                    String[] bounds = parts[1].split("-");
                    if (bounds.length == 2) {
                        try {
                            int lockOrigin = Integer.parseInt(bounds[0]);
                            int lockDest = Integer.parseInt(bounds[1]);
                            if (isOverlap(originOrder, destOrder, lockOrigin, lockDest)) {
                                return false; // Bloqueo activo en Redis para este tramo
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }
            }
        }

        return true;
    }

    @Transactional(readOnly = true)
    public SeatAvailabilityResponse getScheduleAvailability(UUID scheduleId, int originOrder, int destOrder) {
        ScheduleEntity schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Horario de autobús no encontrado con ID: " + scheduleId));

        List<TicketEntity> activeTickets = ticketRepository.findActiveTicketsForSchedule(scheduleId);

        // Redis keys for this schedule
        String lockPattern = "lock:schedule:" + scheduleId + ":seat:*:tramo:*";
        Set<String> redisKeys = redisTemplate.keys(lockPattern);
        Map<Integer, String> lockedSeats = new HashMap<>();

        if (redisKeys != null) {
            for (String key : redisKeys) {
                try {
                    // Extract seat number: key parts: lock, schedule, {id}, seat, {num}, tramo, {origin}-{dest}
                    String[] tokens = key.split(":");
                    int seatNum = Integer.parseInt(tokens[4]);
                    String[] tramoParts = tokens[6].split("-");
                    int lockOrig = Integer.parseInt(tramoParts[0]);
                    int lockDest = Integer.parseInt(tramoParts[1]);

                    if (isOverlap(originOrder, destOrder, lockOrig, lockDest)) {
                        lockedSeats.put(seatNum, lockOrig + "->" + lockDest);
                    }
                } catch (Exception ignored) {}
            }
        }

        List<SeatAvailabilityResponse.SeatDetailDto> seatDetails = new ArrayList<>();
        int availableCount = 0;
        int occupiedCount = 0;

        for (int seat = 1; seat <= schedule.getTotalSeats(); seat++) {
            final int currentSeat = seat;

            Optional<TicketEntity> collidingTicket = activeTickets.stream()
                    .filter(t -> t.getSeatNumber().equals(currentSeat) && isOverlap(originOrder, destOrder, t.getOriginOrder(), t.getDestOrder()))
                    .findFirst();

            if (collidingTicket.isPresent()) {
                TicketEntity t = collidingTicket.get();
                occupiedCount++;
                String status = "PAID".equals(t.getStatus().name()) ? "OCCUPIED_PAID" : "OCCUPIED_PENDING_CASH";
                seatDetails.add(SeatAvailabilityResponse.SeatDetailDto.builder()
                        .seatNumber(currentSeat)
                        .isAvailable(false)
                        .status(status)
                        .passengerName(t.getPassengerName())
                        .occupiedSegment("Parada " + t.getOriginOrder() + " ➔ Parada " + t.getDestOrder())
                        .build());
            } else if (lockedSeats.containsKey(currentSeat)) {
                occupiedCount++;
                seatDetails.add(SeatAvailabilityResponse.SeatDetailDto.builder()
                        .seatNumber(currentSeat)
                        .isAvailable(false)
                        .status("LOCKED_TEMPORARY")
                        .passengerName("Reservando...")
                        .occupiedSegment("Bloqueo temporal en proceso de pago")
                        .build());
            } else {
                availableCount++;
                seatDetails.add(SeatAvailabilityResponse.SeatDetailDto.builder()
                        .seatNumber(currentSeat)
                        .isAvailable(true)
                        .status("AVAILABLE")
                        .build());
            }
        }

        return SeatAvailabilityResponse.builder()
                .scheduleId(schedule.getId())
                .departureTime(schedule.getDepartureTime().toString())
                .requestedOriginOrder(originOrder)
                .requestedDestOrder(destOrder)
                .totalSeats(schedule.getTotalSeats())
                .availableCount(availableCount)
                .occupiedCount(occupiedCount)
                .seats(seatDetails)
                .build();
    }
}
