package com.unihub.workshop.service;

import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;

    public WorkshopService(WorkshopRepository workshopRepository) {
        this.workshopRepository = workshopRepository;
    }

    public List<Workshop> getAllWorkshops() {
        return workshopRepository.findAll();
    }

    public Workshop createWorkshop(Workshop workshop) {
        return workshopRepository.save(workshop);
    }

    // LẤY CHI TIẾT 1 WORKSHOP
    public Workshop getWorkshopById(Long id) {
        return workshopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workshop not found with id: " + id));
    }

    // CẬP NHẬT WORKSHOP
    public Workshop updateWorkshop(Long id, Workshop workshopDetails) {
        Workshop workshop = getWorkshopById(id);
        workshop.setTitle(workshopDetails.getTitle());
        workshop.setDescription(workshopDetails.getDescription());
        workshop.setSpeaker(workshopDetails.getSpeaker());
        workshop.setRoom(workshopDetails.getRoom());
        workshop.setEventDate(workshopDetails.getEventDate());
        workshop.setStartTime(workshopDetails.getStartTime());
        workshop.setRegistrationDeadline(workshopDetails.getRegistrationDeadline());
        workshop.setTotalSeats(workshopDetails.getTotalSeats());
        workshop.setPrice(workshopDetails.getPrice());
        workshop.setCoverImageUrl(workshopDetails.getCoverImageUrl());
        return workshopRepository.save(workshop);
    }

    // XÓA WORKSHOP
    public void deleteWorkshop(Long id) {
        Workshop workshop = getWorkshopById(id);
        workshopRepository.delete(workshop);
    }
}

