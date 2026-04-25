package com.unihub.workshop.controller.dto;

public class TicketDto {
    private String id;
    private String title;
    private String speaker;
    private String date;
    private String time;
    private String room;
    private String status;
    private String qrValue;

    public TicketDto() {
    }

    public TicketDto(String id, String title, String speaker, String date, String time, String room, String status, String qrValue) {
        this.id = id;
        this.title = title;
        this.speaker = speaker;
        this.date = date;
        this.time = time;
        this.room = room;
        this.status = status;
        this.qrValue = qrValue;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getQrValue() {
        return qrValue;
    }

    public void setQrValue(String qrValue) {
        this.qrValue = qrValue;
    }
}
