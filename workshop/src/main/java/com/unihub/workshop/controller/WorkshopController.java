package com.unihub.workshop.controller;

import com.unihub.workshop.entity.Workshop;
import com.unihub.workshop.service.WorkshopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/workshops")
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
    @PreAuthorize("hasRole('ADMIN')")
    public Workshop createWorkshop(@Valid @RequestBody Workshop workshop) {
        return workshopService.createWorkshop(workshop);
    }

    // 4. CẬP NHẬT WORKSHOP (Edit)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Workshop> updateWorkshop(@PathVariable Long id, @Valid @RequestBody Workshop workshopDetails) {
        Workshop updatedWorkshop = workshopService.updateWorkshop(id, workshopDetails);
        return ResponseEntity.ok(updatedWorkshop);
    }

    // 5. XÓA WORKSHOP (Delete)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorkshop(@PathVariable Long id) {
        workshopService.deleteWorkshop(id);
        return ResponseEntity.ok().build();
    }
}
