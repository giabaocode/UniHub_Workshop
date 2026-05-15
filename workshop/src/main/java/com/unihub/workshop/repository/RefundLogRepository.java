package com.unihub.workshop.repository;

import com.unihub.workshop.entity.RefundLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefundLogRepository extends JpaRepository<RefundLog, Long> {
}
