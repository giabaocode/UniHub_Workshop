package com.unihub.workshop.repository;

import com.unihub.workshop.entity.Ticket;
import com.unihub.workshop.entity.User;
import com.unihub.workshop.entity.Workshop;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUser(User user);
    boolean existsByUserAndWorkshop(User user, Workshop workshop);
    // Thêm dòng này vào TicketRepository.java
Optional<Ticket> findByTicketCode(String ticketCode);

    List<Ticket> findByWorkshopId(Long workshopId);
}
