package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.service.WorkshopService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workshops")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkshopController {

    private final WorkshopService workshopService;

    public WorkshopController(WorkshopService workshopService) {
        this.workshopService = workshopService;
    }

    @GetMapping
    public List<Workshop> getAllWorkshops() {
        return workshopService.getAllWorkshops();
    }
}
