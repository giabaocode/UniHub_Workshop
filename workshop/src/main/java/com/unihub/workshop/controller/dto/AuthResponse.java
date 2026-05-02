package com.unihub.workshop.controller.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private String avatarUrl;
    private String phoneNumber;
    private String studentId;
    private String faculty;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String fullName, String role, String avatarUrl, String phoneNumber, String studentId, String faculty) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.phoneNumber = phoneNumber;
        this.studentId = studentId;
        this.faculty = faculty;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
}
