package com.unihub.workshop.service;

import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.repository.WorkshopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkshopService {

    private final WorkshopRepository workshopRepository;

    public WorkshopService(WorkshopRepository workshopRepository) {
        this.workshopRepository = workshopRepository;
    }

    public List<Workshop> getAllWorkshops() {
        return workshopRepository.findAll();
    }
}
