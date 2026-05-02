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

    // 1. LẤY DANH SÁCH
    @GetMapping
    public List<Workshop> getAllWorkshops() {
        return workshopService.getAllWorkshops();
    }

    // 2. LẤY CHI TIẾT 1 WORKSHOP
    @GetMapping("/{id}")
    public ResponseEntity<Workshop> getWorkshopById(@PathVariable Long id) {
        // Sử dụng logic an toàn để xử lý trường hợp không tìm thấy Workshop (trả về 404 Not Found)
        return workshopService.getWorkshopById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. TẠO MỚI
    @PostMapping
    public Workshop createWorkshop(@RequestBody Workshop workshop) {
        return workshopService.createWorkshop(workshop);
    }

    // 4. CẬP NHẬT WORKSHOP (Edit)
    @PutMapping("/{id}")
    public ResponseEntity<Workshop> updateWorkshop(@PathVariable Long id, @RequestBody Workshop workshopDetails) {
        Workshop updatedWorkshop = workshopService.updateWorkshop(id, workshopDetails);
        return ResponseEntity.ok(updatedWorkshop);
    }

    // 5. XÓA WORKSHOP (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkshop(@PathVariable Long id) {
        workshopService.deleteWorkshop(id);
        return ResponseEntity.ok().build();
    }
}