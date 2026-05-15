package com.unihub.workshop.repository;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUser(User user);
    @Query("SELECT t FROM Ticket t JOIN FETCH t.workshop WHERE t.user = :user")
    List<Ticket> findByUserWithWorkshop(@Param("user") User user);
    boolean existsByUserAndWorkshop(User user, Workshop workshop);
    Optional<Ticket> findByUserAndWorkshop(User user, Workshop workshop);
    // Thêm dòng này vào TicketRepository.java
    Optional<Ticket> findByTicketCode(String ticketCode);

    List<Ticket> findByWorkshopId(Long workshopId);
    List<Ticket> findByWorkshopIdAndPaymentStatusIn(Long workshopId, List<String> paymentStatuses);
    long countByWorkshopIdAndPaymentStatusIn(Long workshopId, List<String> paymentStatuses);
    boolean existsByUserIdAndWorkshopId(Long userId, Long workshopId);

    List<Ticket> findByPaymentStatusAndCreatedAtBefore(String status, LocalDateTime time);

    @Modifying
    @Query("UPDATE Ticket t SET t.isScanned = true WHERE t.ticketCode IN :ticketCodes AND t.paymentStatus IN :paymentStatuses AND t.isScanned = false")
    int checkInBatch(@Param("ticketCodes") List<String> ticketCodes, @Param("paymentStatuses") List<String> paymentStatuses);
}
