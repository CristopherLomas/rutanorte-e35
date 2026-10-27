package com.transporte.interparroquial.features.boarding.scheduler;

import com.transporte.interparroquial.features.boarding.service.BoardingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpiredTicketsScheduler {

    private final BoardingService boardingService;

    /**
     * Tarea Programada: Se ejecuta cada 60 segundos ("0 * * * * *").
     * Evalúa la Regla de los 15 Minutos para turnos próximos a salir.
     * Si existen boletos PENDIENTE_CASH sin confirmar a menos de 15 minutos de la salida,
     * cambia automáticamente su estado a EXPIRED, liberando el asiento para venta en ruta.
     */
    @Scheduled(cron = "0 * * * * *")
    public void scheduleExpiredTicketsCancellation() {
        try {
            int cancelled = boardingService.cancelExpiredPendingCashTickets();
            if (cancelled > 0) {
                log.info("Tarea Programada E35: Se cancelaron automáticamente {} reservas en efectivo expiradas.", cancelled);
            }
        } catch (Exception e) {
            log.error("Error al ejecutar tarea programada de boletos expirados: {}", e.getMessage(), e);
        }
    }
}
