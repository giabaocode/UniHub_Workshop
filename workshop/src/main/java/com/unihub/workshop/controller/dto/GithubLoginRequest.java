package com.unihub.workshop.controller.dto;

public class GithubLoginRequest {
    private String code;

    public GithubLoginRequest() {
    }

    public GithubLoginRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
