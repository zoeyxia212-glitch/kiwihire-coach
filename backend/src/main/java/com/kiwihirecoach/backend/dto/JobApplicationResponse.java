package com.kiwihirecoach.backend.dto;

import java.time.LocalDateTime;

public class JobApplicationResponse {
    private Long id;
    private String company;
    private String roleTitle;
    private String status;
    private String jobDescription;
    private LocalDateTime createdAt;
    private Long userId;
    private String userEmail;

    public JobApplicationResponse(Long id, String company, String roleTitle, String status, String jobDescription, LocalDateTime createdAt, Long userId, String userEmail) {
        this.id = id;
        this.company = company;
        this.roleTitle = roleTitle;
        this.status = status;
        this.jobDescription = jobDescription;
        this.createdAt = createdAt;
        this.userId = userId;
        this.userEmail = userEmail;
    }

    public Long getId() {
        return id;
    }

    public String getCompany() {
        return company;
    }

    public String getRoleTitle() {
        return roleTitle;
    }

    public String getStatus() {
        return status;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }
}