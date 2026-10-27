package com.transporte.interparroquial.features.booking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transporte.interparroquial.features.booking.dto.ConfirmPurchaseRequest;
import com.transporte.interparroquial.features.booking.dto.LockSeatRequest;
import com.transporte.interparroquial.features.booking.dto.LockSeatResponse;
import com.transporte.interparroquial.features.booking.dto.TicketResponse;
import com.transporte.interparroquial.features.booking.entity.PaymentMethod;
import com.transporte.interparroquial.features.booking.entity.ScheduleEntity;
import com.transporte.interparroquial.features.booking.entity.TicketEntity;
import com.transporte.interparroquial.features.booking.entity.TicketStatus;
import com.transporte.interparroquial.features.booking.repository.ScheduleRepository;
import com.transporte.interparroquial.features.booking.repository.TicketRepository;
import com.transporte.interparroquial.features.routes.dto.FareCalculationResponse;
import com.transporte.interparroquial.features.routes.entity.StopEntity;
import com.transporte.interparroquial.features.routes.repository.StopRepository;
import com.transporte.interparroquial.features.routes.service.RouteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final TicketRepository ticketRepository;
    private final ScheduleRepository scheduleRepository;
    private final StopRepository stopRepository;
    private final SeatAvailabilityService seatAvailabilityService;
    private final RouteService routeService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.booking.seat-lock-ttl-seconds:300}")
    private long lockTtlSeconds;

    /**
     * Bloqueo Distribuido en Redis:
     * Guarda la clave con TTL de 5 minutos mientras el usuario llena sus datos y realiza el pago.
     */
    public LockSeatResponse lockSeat(LockSeatRequest request) {
        boolean available = seatAvailabilityService.isSeatAvailable(
                request.getScheduleId(),
                request.getSeatNumber(),
                request.getOriginOrder(),
                request.getDestOrder()
        );

        if (!available) {
            return LockSeatResponse.builder()
                    .success(false)
                    .scheduleId(request.getScheduleId())
                    .seatNumber(request.getSeatNumber())
                    .ttlSeconds(0)
                    .message("El asiento #" + request.getSeatNumber() + " no está disponible para el tramo seleccionado.")
                    .build();
        }

        String lockKey = String.format("lock:schedule:%s:seat:%d:tramo:%d-%d",
                request.getScheduleId(), request.getSeatNumber(), request.getOriginOrder(), request.getDestOrder());

        Map<String, Object> lockPayload = new HashMap<>();
        lockPayload.put("seatNumber", request.getSeatNumber());
        lockPayload.put("originOrder", request.getOriginOrder());
        lockPayload.put("destOrder", request.getDestOrder());
        lockPayload.put("clientSessionId", request.getClientSessionId());
        lockPayload.put("lockedAt", LocalDateTime.now().toString());

        // Almacenar en Redis con expiración automática de 5 minutos
        redisTemplate.opsForValue().set(lockKey, lockPayload, lockTtlSeconds, TimeUnit.SECONDS);

        log.info("Bloqueo distribuido adquirido en Redis: {} por {} segundos", lockKey, lockTtlSeconds);

        return LockSeatResponse.builder()
                .success(true)
                .lockKey(lockKey)
                .scheduleId(request.getScheduleId())
                .seatNumber(request.getSeatNumber())
                .ttlSeconds(lockTtlSeconds)
                .expiresAt(LocalDateTime.now().plusSeconds(lockTtlSeconds))
                .message("Asiento #" + request.getSeatNumber() + " bloqueado temporalmente por 5 minutos.")
                .build();
    }

    /**
     * Confirmación y Emisión de Boleto:
     * Crea el registro en PostgreSQL (Supabase), genera el hash QR y libera el bloqueo de Redis.
     */
    @Transactional
    public TicketResponse confirmPurchase(ConfirmPurchaseRequest request) {
        ScheduleEntity schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new IllegalArgumentException("Horario de viaje no encontrado."));

        StopEntity originStop = stopRepository.findById(request.getOriginStopId())
                .orElseThrow(() -> new IllegalArgumentException("Parada de origen no encontrada."));

        StopEntity destStop = stopRepository.findById(request.getDestinationStopId())
                .orElseThrow(() -> new IllegalArgumentException("Parada de destino no encontrada."));

        // Calcular tarifa exacta
        FareCalculationResponse fare = routeService.calculateFare(
                request.getOriginStopId(),
                request.getDestinationStopId(),
                Boolean.TRUE.equals(request.getIsSeniorCitizen())
        );

        // Estado según método de pago
        TicketStatus initialStatus;
        if (request.getPaymentMethod() == PaymentMethod.CASH_CONTROLLER) {
            initialStatus = TicketStatus.PENDING_CASH;
        } else {
            initialStatus = TicketStatus.PAID;
        }

        // Generar hash único para el código QR
        String ticketCode = "E35-" + (100000 + new Random().nextInt(900000));
        String qrHash = "QR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        TicketEntity ticket = TicketEntity.builder()
                .scheduleId(schedule.getId())
                .userId(request.getUserId())
                .seatNumber(request.getSeatNumber())
                .originStopId(originStop.getId())
                .destinationStopId(destStop.getId())
                .originOrder(request.getOriginOrder())
                .destOrder(request.getDestOrder())
                .passengerName(request.getPassengerName().trim())
                .passengerCedula(request.getPassengerCedula().trim())
                .passengerPhone(request.getPassengerPhone().trim())
                .basePrice(fare.getBasePrice())
                .discountApplied(fare.getDiscountApplied())
                .finalPrice(fare.getFinalPrice())
                .paymentMethod(request.getPaymentMethod())
                .status(initialStatus)
                .qrCodeHash(qrHash)
                .build();

        TicketEntity savedTicket = ticketRepository.save(ticket);

        // Liberar el bloqueo temporal en Redis
        String lockKey = String.format("lock:schedule:%s:seat:%d:tramo:%d-%d",
                request.getScheduleId(), request.getSeatNumber(), request.getOriginOrder(), request.getDestOrder());
        redisTemplate.delete(lockKey);
        log.info("Bloqueo de Redis liberado tras emisión de boleto: {}", lockKey);

        // Generar JSON Payload embebido en el código QR
        Map<String, Object> qrPayloadMap = new HashMap<>();
        qrPayloadMap.put("ticketId", ticketCode);
        qrPayloadMap.put("qrHash", qrHash);
        qrPayloadMap.put("passenger", savedTicket.getPassengerName());
        qrPayloadMap.put("cedula", savedTicket.getPassengerCedula());
        qrPayloadMap.put("route", originStop.getName() + " -> " + destStop.getName());
        qrPayloadMap.put("time", schedule.getDepartureTime().toString());
        qrPayloadMap.put("seat", savedTicket.getSeatNumber());
        qrPayloadMap.put("coop", schedule.getCooperativeName());
        qrPayloadMap.put("disco", schedule.getBusNumber());
        qrPayloadMap.put("status", savedTicket.getStatus().name());
        qrPayloadMap.put("totalUSD", savedTicket.getFinalPrice());

        String qrPayloadJson;
        try {
            qrPayloadJson = objectMapper.writeValueAsString(qrPayloadMap);
        } catch (Exception e) {
            qrPayloadJson = qrHash;
        }

        String message = initialStatus == TicketStatus.PENDING_CASH
                ? "Boleto emitido en estado PENDIENTE DE PAGO AL CONTROLADOR. Debe presentarse y pagar al menos 15 minutos antes de la salida."
                : "Boleto emitido y PAGADO exitosamente.";

        return TicketResponse.builder()
                .id(savedTicket.getId())
                .ticketCode(ticketCode)
                .qrCodeHash(qrHash)
                .qrPayloadJson(qrPayloadJson)
                .passengerName(savedTicket.getPassengerName())
                .passengerCedula(savedTicket.getPassengerCedula())
                .passengerPhone(savedTicket.getPassengerPhone())
                .seatNumber(savedTicket.getSeatNumber())
                .cooperativeName(schedule.getCooperativeName())
                .busNumber(schedule.getBusNumber())
                .plate(schedule.getPlate())
                .departureTime(schedule.getDepartureTime().toString())
                .originName(originStop.getName())
                .destinationName(destStop.getName())
                .basePrice(savedTicket.getBasePrice())
                .discountApplied(savedTicket.getDiscountApplied())
                .finalPrice(savedTicket.getFinalPrice())
                .paymentMethod(savedTicket.getPaymentMethod())
                .status(savedTicket.getStatus())
                .isPreferential(fare.getIsSeniorDiscountApplied())
                .createdAt(savedTicket.getCreatedAt())
                .message(message)
                .build();
    }
}
