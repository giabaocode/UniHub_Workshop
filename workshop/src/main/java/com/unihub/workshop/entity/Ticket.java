package com.unihub.workshop.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ticket", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "workshop_id"})
})
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", nullable = false, unique = true)
    private String ticketCode;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "workshop_id", nullable = false)
    private Workshop workshop;

    // ĐÃ SỬA: Dùng Boolean (chữ B viết hoa) để cho phép nhận giá trị NULL từ Database
    @Column(name = "check_in_status")
    private Boolean isScanned = false;

    @Column(name = "payment_status")
    private String paymentStatus = "PAID"; 

    // Constructor rỗng
    public Ticket() {
    }

    // Constructor đầy đủ
    public Ticket(String ticketCode, User user, Workshop workshop, Boolean isScanned) {
        this.ticketCode = ticketCode;
        this.user = user;
        this.workshop = workshop;
        this.isScanned = isScanned;
        this.paymentStatus = "PAID";
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Workshop getWorkshop() { return workshop; }
    public void setWorkshop(Workshop workshop) { this.workshop = workshop; }
    
    // ĐÃ SỬA: Hàm này an toàn tuyệt đối. Nếu DB bị null thì tự động trả về false
    public boolean isScanned() { 
        return this.isScanned != null ? this.isScanned : false; 
    }
    
    public void setScanned(Boolean scanned) { 
        this.isScanned = scanned; 
    }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}