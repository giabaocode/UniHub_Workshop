package com.unihub.workshop.repository;

import com.unihub.workshop.entity.Workshop;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Workshop w WHERE w.id = :id")
    Optional<Workshop> findByIdForUpdate(@Param("id") Long id);

    @Modifying
    @Query(value = """
            UPDATE workshop w
            SET booked_spots = COALESCE(w.booked_spots, 0) + 1
            WHERE w.id = :id
              AND COALESCE(w.booked_spots, 0) < w.total_seats
            """, nativeQuery = true)
    int incrementSeatIfAvailable(@Param("id") Long id);   

    @Modifying
    @Query("UPDATE Workshop w SET w.bookedSpots = w.bookedSpots - 1 WHERE w.id = :id AND w.bookedSpots > 0")
    int decrementSeat(@Param("id") Long id);

    @Modifying
    @Query(value = """
            UPDATE workshop w
            SET booked_spots = COALESCE((
                SELECT COUNT(*)
                FROM ticket t
                WHERE t.workshop_id = w.id
                  AND t.payment_status IN ('PENDING', 'PAID', 'PAY_AT_COUNTER')
            ), 0)
            """, nativeQuery = true)
    int syncBookedSpotsFromActiveTickets();
}
