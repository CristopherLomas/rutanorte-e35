package com.transporte.interparroquial.features.boarding.service;

import com.transporte.interparroquial.features.boarding.dto.ScanQrResponse;
import com.transporte.interparroquial.features.booking.entity.PaymentMethod;
import com.transporte.interparroquial.features.booking.entity.ScheduleEntity;
import com.transporte.interparroquial.features.booking.entity.TicketEntity;
import com.transporte.interparroquial.features.booking.entity.TicketStatus;
import com.transporte.interparroquial.features.booking.repository.ScheduleRepository;
import com.transporte.interparroquial.features.booking.repository.TicketRepository;
import com.transporte.interparroquial.features.routes.entity.StopEntity;
import com.transporte.interparroquial.features.routes.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardingService {

    private final TicketRepository ticketRepository;
    private final ScheduleRepository scheduleRepository;
    private final StopRepository stopRepository;

    @Transactional(readOnly = true)
    public ScanQrResponse scanQr(String qrHash) {
        TicketEntity ticket = ticketRepository.findByQrCodeHash(qrHash.trim())
                .orElseThrow(() -> new IllegalArgumentException("Boleto no encontrado con el código QR provisto: " + qrHash));

        ScheduleEntity schedule = scheduleRepository.findById(ticket.getScheduleId())
                .orElse(null);

        StopEntity origin = stopRepository.findById(ticket.getOriginStopId())
                .orElse(null);

        StopEntity dest = stopRepository.findById(ticket.getDestinationStopId())
                .orElse(null);

        String message;
        boolean actionRequired = false;

        if (ticket.getStatus() == TicketStatus.BOARDED) {
            message = "PASAJERO YA ABORDÓ a las " + (ticket.getBoardedAt() != null ? ticket.getBoardedAt().toLocalTime() : "hora previa");
        } else if (ticket.getStatus() == TicketStatus.PAID) {
            message = "Boleto Pagado en Línea - Pasajero Verificado. Listo para abordar.";
        } else if (ticket.getStatus() == TicketStatus.PENDING_CASH) {
            actionRequired = true;
            message = String.format("⚠️ PAGO PENDIENTE EN EFECTIVO - Cobrar al pasajero: $%.2f USD antes de abordar.", ticket.getFinalPrice());
        } else {
            message = "⚠️ BOLETO EXPIRADO: Cancelado automáticamente por no confirmar pago 15 minutos antes.";
        }

        return ScanQrResponse.builder()
                .ticketId(ticket.getId())
                .qrCodeHash(ticket.getQrCodeHash())
                .passengerName(ticket.getPassengerName())
                .passengerCedula(ticket.getPassengerCedula())
                .seatNumber(ticket.getSeatNumber())
                .originStopName(origin != null ? origin.getName() : "Origen")
                .destinationStopName(dest != null ? dest.getName() : "Destino")
                .originOrder(ticket.getOriginOrder())
                .destOrder(ticket.getDestOrder())
                .departureTime(schedule != null ? schedule.getDepartureTime().toString() : "--:--")
                .busNumber(schedule != null ? schedule.getBusNumber() : "Bus E35")
                .cooperativeName(schedule != null ? schedule.getCooperativeName() : "Coop")
                .amountUSD(ticket.getFinalPrice())
                .paymentMethod(ticket.getPaymentMethod())
                .status(ticket.getStatus())
                .isBoarded(ticket.getStatus() == TicketStatus.BOARDED)
                .boardedAt(ticket.getBoardedAt())
                .isActionRequired(actionRequired)
                .verificationMessage(message)
                .build();
    }

    @Transactional
    public ScanQrResponse confirmCashAndBoard(String qrHash) {
        TicketEntity ticket = ticketRepository.findByQrCodeHash(qrHash.trim())
                .orElseThrow(() -> new IllegalArgumentException("Boleto no encontrado con el código QR: " + qrHash));

        if (ticket.getStatus() == TicketStatus.EXPIRED) {
            throw new IllegalStateException("El boleto se encuentra EXPIRADO y su asiento fue liberado.");
        }

        ticket.setStatus(TicketStatus.BOARDED);
        ticket.setBoardedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        log.info("Controlador registró cobro en efectivo y abordaje para boleto: {}", qrHash);
        return scanQr(qrHash);
    }

    @Transactional
    public ScanQrResponse confirmBoarding(String qrHash) {
        TicketEntity ticket = ticketRepository.findByQrCodeHash(qrHash.trim())
                .orElseThrow(() -> new IllegalArgumentException("Boleto no encontrado con el código QR: " + qrHash));

        if (ticket.getStatus() == TicketStatus.PENDING_CASH) {
            throw new IllegalStateException("El boleto tiene pago en efectivo pendiente. Use confirm-cash-and-board.");
        }
        if (ticket.getStatus() == TicketStatus.EXPIRED) {
            throw new IllegalStateException("El boleto se encuentra EXPIRADO.");
        }

        ticket.setStatus(TicketStatus.BOARDED);
        ticket.setBoardedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        log.info("Pasajero verificado y marcado como ABORDADO para boleto: {}", qrHash);
        return scanQr(qrHash);
    }

    /**
     * Limpieza Automática de Boletos Expirados (Regla 15 Minutos):
     * Cancela todas las reservas en efectivo no confirmadas 15 minutos antes de la salida.
     */
    @Transactional
    public int cancelExpiredPendingCashTickets() {
        LocalTime now = LocalTime.now();
        LocalTime threshold = now.plusMinutes(15);

        List<ScheduleEntity> upcomingSchedules = scheduleRepository.findByDepartureTimeBetween(now, threshold);
        if (upcomingSchedules.isEmpty()) {
            return 0;
        }

        List<UUID> scheduleIds = upcomingSchedules.stream().map(ScheduleEntity::getId).toList();
        List<TicketEntity> pendingTickets = ticketRepository.findPendingCashTicketsForSchedules(scheduleIds);

        int cancelledCount = 0;
        for (TicketEntity t : pendingTickets) {
            t.setStatus(TicketStatus.EXPIRED);
            cancelledCount++;
            log.warn("Regla de 15 Minutos: Boleto {} (Asiento #{}) cancelado por no confirmar pago en efectivo.",
                    t.getQrCodeHash(), t.getSeatNumber());
        }

        if (cancelledCount > 0) {
            ticketRepository.saveAll(pendingTickets);
            log.info("ExpiredTicketsScheduler: {} boletos en efectivo expiraron y liberaron sus asientos.", cancelledCount);
        }

        return cancelledCount;
    }
}
