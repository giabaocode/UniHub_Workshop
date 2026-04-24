package com.unihub.workshop.repository;

import com.unihub.workshop.entity.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
}
