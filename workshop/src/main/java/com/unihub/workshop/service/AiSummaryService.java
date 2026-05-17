package com.unihub.workshop.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Gọi Gemini API ở backend. Frontend không bao giờ giữ API key.
 *
 * Có 2 tác vụ:
 *  1. summarizeWorkshop  — tóm tắt nhanh từ title/description/agenda.
 *  2. summarizePdfText    — nhận text đã trích xuất từ PDF (frontend dùng pdfjs)
 *                            và trả briefSummary / detailedSummary / hashtags.
 *
 * Khi GEMINI_ENABLED=false hoặc API key trống, fallback sang tóm tắt rút gọn local
 * để FE vẫn chạy được khi demo offline.
 */
@Service
public class AiSummaryService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    @Value("${app.ai.gemini.enabled:true}")
    private boolean enabled;

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash-latest}")
    private String model;

    @Value("${app.ai.gemini.api-base-url:https://generativelanguage.googleapis.com}")
    private String apiBaseUrl;

    public AiSummaryService(RestTemplateBuilder builder,
                            @Value("${app.ai.gemini.timeout-seconds:30}") int timeoutSeconds) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(Math.max(5, timeoutSeconds)))
                .setReadTimeout(Duration.ofSeconds(Math.max(5, timeoutSeconds)))
                .build();
    }

    public Map<String, Object> summarizeWorkshop(String title, String description, List<String> agenda) {
        String safeTitle = title == null ? "" : title;
        String safeDescription = description == null ? "" : description;
        List<String> safeAgenda = agenda == null ? List.of() : agenda;

        if (!isConfigured()) {
            return localSummary(safeTitle, safeDescription);
        }

        StringBuilder agendaText = new StringBuilder();
        if (safeAgenda.isEmpty()) {
            agendaText.append("(Không có danh sách cụ thể)");
        } else {
            for (int i = 0; i < safeAgenda.size(); i++) {
                agendaText.append(i + 1).append(". ").append(safeAgenda.get(i)).append('\n');
            }
        }

        String prompt = "Đọc thông tin workshop và tóm tắt.\n" +
                "KHÔNG chào hỏi, KHÔNG dùng icon, CHỈ in ra ĐÚNG định dạng sau:\n\n" +
                "[SUMMARY]\nViết 2-3 câu tóm tắt tại đây.\n[HASHTAGS]\nkynang, phongvan, sinhvien\n\n" +
                "Thông tin:\nTên: " + safeTitle + "\nMô tả: " + safeDescription + "\nChương trình: " + agendaText;

        try {
            String text = callGemini(prompt, 1024, 0.2);
            return parseSummaryHashtags(text, safeTitle, safeDescription);
        } catch (RuntimeException ex) {
            System.err.println("[AiSummaryService] Gemini lỗi, fallback local: " + ex.getMessage());
            return localSummary(safeTitle, safeDescription);
        }
    }

    public Map<String, Object> summarizePdfText(String pdfText) {
        if (pdfText == null || pdfText.trim().length() < 30) {
            throw new RuntimeException("Nội dung PDF quá ngắn hoặc trống.");
        }

        String truncated = pdfText.length() > 20_000 ? pdfText.substring(0, 20_000) : pdfText;

        if (!isConfigured()) {
            return Map.of(
                    "briefSummary", truncated.length() > 200 ? truncated.substring(0, 200) + "..." : truncated,
                    "detailedSummary", truncated,
                    "hashtags", List.of("workshop", "sinhvien")
            );
        }

        String prompt = "Bạn là trợ lý AI của UniHub Workshop. \n" +
                "Dưới đây là nội dung trích xuất từ file PDF giới thiệu workshop.\n" +
                "Hãy tạo 2 phiên bản tóm tắt và danh sách hashtag.\n\n" +
                "KHÔNG chào hỏi, KHÔNG dùng icon, CHỈ in ra ĐÚNG định dạng sau:\n\n" +
                "[BRIEF_SUMMARY]\n(Viết 1-2 câu cực kỳ ngắn gọn để hiển thị ở thẻ tóm tắt nhanh)\n\n" +
                "[DETAILED_SUMMARY]\n(Trình bày chi tiết, đầy đủ về nội dung, lộ trình và mục tiêu của workshop. Sử dụng dấu '-' cho các ý chính)\n\n" +
                "[HASHTAGS]\ntag1, tag2, tag3, tag4, tag5\n\n" +
                "--- NỘI DUNG PDF ---\n" + truncated + "\n--- HẾT ---";

        String text = callGemini(prompt, 4096, 0.3);
        return parsePdfSummary(text);
    }

    private boolean isConfigured() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    private String callGemini(String prompt, int maxTokens, double temperature) {
        String url = apiBaseUrl + "/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "temperature", temperature,
                        "maxOutputTokens", maxTokens
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class
            );
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            String text = textNode.isMissingNode() ? "" : textNode.asText("");
            if (text.isBlank()) {
                throw new RuntimeException("Gemini không trả về nội dung.");
            }
            return text;
        } catch (HttpClientErrorException ex) {
            throw new RuntimeException("Gemini API lỗi: " + ex.getStatusCode() + " " + ex.getResponseBodyAsString(), ex);
        } catch (Exception ex) {
            throw new RuntimeException("Gemini API thất bại: " + ex.getMessage(), ex);
        }
    }

    private Map<String, Object> parseSummaryHashtags(String text, String fallbackTitle, String fallbackDescription) {
        String cleaned = text.replaceAll("(?i)🤖|AI Tóm tắt:|Dạ,|Dưới đây là", "").trim();
        String summary;
        List<String> hashtags = new ArrayList<>();

        Pattern summaryPattern = Pattern.compile("\\[SUMMARY\\]([\\s\\S]*?)\\[HASHTAGS\\]", Pattern.CASE_INSENSITIVE);
        Matcher mSummary = summaryPattern.matcher(cleaned);
        if (mSummary.find()) {
            summary = mSummary.group(1).trim();
        } else {
            summary = cleaned.replaceAll("(?i)\\[SUMMARY\\]|\\[HASHTAGS\\][\\s\\S]*", "").trim();
        }
        if (summary.isBlank()) {
            summary = localSummaryText(fallbackTitle, fallbackDescription);
        }

        Pattern tagPattern = Pattern.compile("\\[HASHTAGS\\]([\\s\\S]*)", Pattern.CASE_INSENSITIVE);
        Matcher mTags = tagPattern.matcher(cleaned);
        if (mTags.find()) {
            String raw = mTags.group(1).trim();
            for (String tag : raw.split(",")) {
                String t = tag.trim().replaceAll("^#", "");
                if (!t.isEmpty()) hashtags.add(t);
            }
        }

        return Map.of(
                "summary", summary,
                "hashtags", hashtags,
                "raw", "[SUMMARY]\n" + summary + "\n[HASHTAGS]\n" + String.join(", ", hashtags)
        );
    }

    private Map<String, Object> parsePdfSummary(String text) {
        String brief = "";
        String detailed = "";
        List<String> hashtags = new ArrayList<>();

        Pattern p = Pattern.compile("\\[(BRIEF_SUMMARY|DETAILED_SUMMARY|HASHTAGS)\\]([\\s\\S]*?)(?=\\[(?:BRIEF_SUMMARY|DETAILED_SUMMARY|HASHTAGS)\\]|$)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        while (m.find()) {
            String name = m.group(1).toUpperCase();
            String content = m.group(2).trim();
            switch (name) {
                case "BRIEF_SUMMARY" -> brief = content;
                case "DETAILED_SUMMARY" -> detailed = content;
                case "HASHTAGS" -> {
                    for (String tag : content.split(",")) {
                        String t = tag.trim().replaceAll("^#", "");
                        if (!t.isEmpty()) hashtags.add(t);
                    }
                }
            }
        }

        if (brief.isBlank() && detailed.isBlank()) {
            brief = text.length() > 200 ? text.substring(0, 200) + "..." : text;
            detailed = text;
        } else if (detailed.isBlank()) {
            detailed = brief;
        } else if (brief.isBlank()) {
            brief = detailed.length() > 150 ? detailed.substring(0, 150) + "..." : detailed;
        }

        return Map.of(
                "briefSummary", brief,
                "detailedSummary", detailed,
                "hashtags", hashtags
        );
    }

    private Map<String, Object> localSummary(String title, String description) {
        return Map.of(
                "summary", localSummaryText(title, description),
                "hashtags", List.of("unihub", "workshop"),
                "raw", "[SUMMARY]\n" + localSummaryText(title, description) + "\n[HASHTAGS]\nunihub, workshop"
        );
    }

    private String localSummaryText(String title, String description) {
        String base = (title + ". " + description).trim();
        if (base.length() > 300) {
            base = base.substring(0, 300) + "...";
        }
        return base.isBlank() ? "Chưa có dữ liệu để tóm tắt." : base;
    }
}
