package com.unihub.workshop.repository;

import com.unihub.workshop.entity.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    @Modifying
    @Query("UPDATE Workshop w SET w.bookedSpots = w.bookedSpots + 1 WHERE w.id = :id AND w.bookedSpots < w.totalSeats")
    int incrementSeatIfAvailable(@Param("id") Long id);   
}
