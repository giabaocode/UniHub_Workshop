package com.unihub.workshop.repository;

import com.unihub.workshop.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    void deleteByTicketIdIn(List<Long> ticketIds);
}
