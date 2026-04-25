package com.unihub.workshop.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tickets") // Tên bảng trong Database
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ticketCode;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    @Column(nullable = false)
    private boolean isScanned = false; // Mặc định là chưa quét (check-in)

    // 1. Constructor rỗng (Bắt buộc phải có cho Spring JPA)
    public Ticket() {
    }

    // 2. Constructor với 4 tham số (Đây chính là cái để sửa lỗi Undefined)
    public Ticket(String ticketCode, User user, Workshop workshop, boolean isScanned) {
        this.ticketCode = ticketCode;
        this.user = user;
        this.workshop = workshop;
        this.isScanned = isScanned;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Workshop getWorkshop() {
        return workshop;
    }

    public void setWorkshop(Workshop workshop) {
        this.workshop = workshop;
    }

    public boolean isScanned() {
        return isScanned;
    }

    public void setScanned(boolean scanned) {
        isScanned = scanned;
    }
}