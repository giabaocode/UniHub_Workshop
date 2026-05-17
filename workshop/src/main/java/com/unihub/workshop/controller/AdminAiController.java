package com.unihub.workshop.controller;

import com.unihub.workshop.service.AiSummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoint AI dành cho Admin. Tất cả tóm tắt PDF/text đều được xử lý ở backend
 * để KHÔNG bao giờ lộ Gemini API key ra client. Frontend chỉ trích xuất text từ
 * PDF rồi POST sang đây.
 */
@RestController
@RequestMapping("/api/admin/ai")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAiController {

    private final AiSummaryService aiSummaryService;

    public AdminAiController(AiSummaryService aiSummaryService) {
        this.aiSummaryService = aiSummaryService;
    }

    /** Tóm tắt nhanh từ tiêu đề / mô tả / agenda. */
    @PostMapping("/summarize-workshop")
    public ResponseEntity<?> summarizeWorkshop(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("title", "");
        String description = (String) payload.getOrDefault("description", "");
        Object agendaRaw = payload.get("agenda");

        List<String> agenda = List.of();
        if (agendaRaw instanceof List<?> rawList) {
            agenda = rawList.stream()
                    .filter(item -> item != null)
                    .map(Object::toString)
                    .toList();
        }

        return ResponseEntity.ok(aiSummaryService.summarizeWorkshop(title, description, agenda));
    }

    /**
     * Tóm tắt từ text PDF do FE trích xuất (pdf.js).
     * Tách trích xuất ở client để không phải gửi nguyên file PDF qua mạng,
     * còn AI key + prompt tuning vẫn nằm trên backend.
     */
    @PostMapping("/summarize-pdf-text")
    public ResponseEntity<?> summarizePdfText(@RequestBody Map<String, Object> payload) {
        String pdfText = (String) payload.getOrDefault("pdfText", "");
        try {
            return ResponseEntity.ok(aiSummaryService.summarizePdfText(pdfText));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
