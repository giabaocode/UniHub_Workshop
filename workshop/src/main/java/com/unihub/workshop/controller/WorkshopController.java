package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.service.WorkshopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workshops")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkshopController {

    private final WorkshopService workshopService;

    public WorkshopController(WorkshopService workshopService) {
        this.workshopService = workshopService;
    }

    // LẤY DANH SÁCH
    @GetMapping
    public List<Workshop> getAllWorkshops() {
        return workshopService.getAllWorkshops();
    }

    // TẠO MỚI
    @PostMapping
    public Workshop createWorkshop(@RequestBody Workshop workshop){
        return workshopService.createWorkshop(workshop);
    }

    // ================= CHỖ BỊ THIẾU TỪ ĐÂY =================

    // 1. LẤY CHI TIẾT 1 WORKSHOP (Trị con bug 403)
    @GetMapping("/{id}")
    public ResponseEntity<Workshop> getWorkshopById(@PathVariable Long id) {
        Workshop workshop = workshopService.getWorkshopById(id); // Bạn nhớ check lại tên hàm bên Service nhé
        return ResponseEntity.ok(workshop);
    }

    // 2. CẬP NHẬT WORKSHOP (Edit)
    @PutMapping("/{id}")
    public ResponseEntity<Workshop> updateWorkshop(@PathVariable Long id, @RequestBody Workshop workshopDetails) {
        Workshop updatedWorkshop = workshopService.updateWorkshop(id, workshopDetails);
        return ResponseEntity.ok(updatedWorkshop);
    }

    // 3. XÓA WORKSHOP (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkshop(@PathVariable Long id) {
        workshopService.deleteWorkshop(id);
        return ResponseEntity.ok().build();
    }
}