package com.unihub.workshop.entity;

import jakarta.persistence.*;

@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String ticketCode;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "workshop_id")
    private Workshop workshop;

    private String paymentStatus;
    private Boolean checkInStatus;

    public Ticket() {
    }

    public Ticket(String ticketCode, User user, Workshop workshop, String paymentStatus, Boolean checkInStatus) {
        this.ticketCode = ticketCode;
        this.user = user;
        this.workshop = workshop;
        this.paymentStatus = paymentStatus;
        this.checkInStatus = checkInStatus;
    }

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

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Boolean getCheckInStatus() {
        return checkInStatus;
    }

    public void setCheckInStatus(Boolean checkInStatus) {
        this.checkInStatus = checkInStatus;
    }
}
