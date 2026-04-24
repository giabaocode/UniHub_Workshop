package com.unihub.workshop.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
public class Workshop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String speaker;
    private LocalDate eventDate;
    private LocalTime startTime;
    private String room;
    private Integer totalSeats;
    private Double price;
    private LocalDateTime registrationDeadline;

    @Column(columnDefinition = "TEXT")
    private String description;

    // CỘT MỚI: CHỨA LINK ẢNH BÌA
    @Column(columnDefinition = "TEXT")
    private String coverImageUrl;

    public Workshop() {
    }

    // ĐÃ CẬP NHẬT CONSTRUCTOR THÊM coverImageUrl
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSpeaker() {
        return speaker;
    }

    public void setSpeaker(String speaker) {
        this.speaker = speaker;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public LocalDateTime getRegistrationDeadline() {
        return registrationDeadline;
    }

    public void setRegistrationDeadline(LocalDateTime registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }
}