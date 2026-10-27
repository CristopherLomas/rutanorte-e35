package com.transporte.interparroquial.features.booking.repository;

import com.transporte.interparroquial.features.booking.entity.TicketEntity;
import com.transporte.interparroquial.features.booking.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity, UUID> {

    Optional<TicketEntity> findByQrCodeHash(String qrCodeHash);

    List<TicketEntity> findByScheduleIdAndStatusIn(UUID scheduleId, Collection<TicketStatus> statuses);

    List<TicketEntity> findByScheduleIdAndSeatNumberAndStatusIn(
            UUID scheduleId, Integer seatNumber, Collection<TicketStatus> statuses);

    @Query("SELECT t FROM TicketEntity t WHERE t.scheduleId = :scheduleId AND t.status IN ('PAID', 'PENDING_CASH')")
    List<TicketEntity> findActiveTicketsForSchedule(@Param("scheduleId") UUID scheduleId);

    @Query("SELECT t FROM TicketEntity t WHERE t.scheduleId IN :scheduleIds AND t.status = 'PENDING_CASH'")
    List<TicketEntity> findPendingCashTicketsForSchedules(@Param("scheduleIds") List<UUID> scheduleIds);
}
