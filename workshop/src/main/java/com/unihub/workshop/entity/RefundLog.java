package com.unihub.workshop.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
public class RefundLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ticketCode;

    private Double amount;
    
    private String reason;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING hoặc REFUNDED

    @CreationTimestamp
    private LocalDateTime createdAt;

    public RefundLog() {}

    public RefundLog(String ticketCode, Double amount, String reason) {
        this.ticketCode = ticketCode;
        this.amount = amount;
        this.reason = reason;
        this.status = "PENDING";
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
