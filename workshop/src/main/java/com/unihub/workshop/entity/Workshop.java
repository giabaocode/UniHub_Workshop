package com.unihub.workshop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
public class Workshop {
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String speaker;
    private LocalDate eventDate;
    private LocalTime startTime;
    private String room;
    private Integer totalSeats;
    @Min(value = 0, message = "Giá vé không được âm")
    private Double price;
    private LocalDateTime registrationDeadline;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Ảnh bìa workshop
    @Column(columnDefinition = "TEXT")
    private String coverImageUrl;

    // PDF tài liệu
    @Column(columnDefinition = "TEXT")
    private String pdfUrl;

    // Sơ đồ phòng (ảnh) — admin upload, FE hiển thị thay cho placeholder
    @Column(columnDefinition = "TEXT", name = "room_map_url")
    private String roomMapUrl;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "booked_spots")
    private Integer bookedSpots = 0;

    /**
     * Trạng thái sự kiện. ACTIVE (mặc định) hoặc CANCELLED.
     * Workshop CANCELLED vẫn được lưu để truy vết, nhưng FE student sẽ ẩn / hiển thị nhãn "Đã hủy".
     */
    @Column(name = "status", length = 32)
    private String status = STATUS_ACTIVE;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Version
    private Long version;

    public Workshop() {
    }

    public Workshop(String title, String speaker, LocalDate eventDate, LocalTime startTime, String room, Integer totalSeats, Double price, LocalDateTime registrationDeadline, String description, String coverImageUrl) {
        this.title = title;
        this.speaker = speaker;
        this.eventDate = eventDate;
        this.startTime = startTime;
        this.room = room;
        this.totalSeats = totalSeats;
        this.price = price;
        this.registrationDeadline = registrationDeadline;
        this.description = description;
        this.coverImageUrl = coverImageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSpeaker() { return speaker; }
    public void setSpeaker(String speaker) { this.speaker = speaker; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public LocalDateTime getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDateTime registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getRoomMapUrl() { return roomMapUrl; }
    public void setRoomMapUrl(String roomMapUrl) { this.roomMapUrl = roomMapUrl; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public Integer getBookedSpots() { return bookedSpots != null ? bookedSpots : 0; }
    public void setBookedSpots(Integer bookedSpots) { this.bookedSpots = bookedSpots; }

    public String getStatus() { return status == null ? STATUS_ACTIVE : status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public Long getVersion() { return version; }
}
