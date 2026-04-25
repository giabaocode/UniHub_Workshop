package com.unihub.workshop.controller.dto;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String studentId;
    private String faculty;

    public RegisterRequest() {}

    public RegisterRequest(String fullName, String email, String password, String studentId, String faculty) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.studentId = studentId;
        this.faculty = faculty;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }
}
