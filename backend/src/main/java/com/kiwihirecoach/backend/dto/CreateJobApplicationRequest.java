package com.kiwihirecoach.backend.dto;

public class CreateJobApplicationRequest {
    private Long userId;
    private String company;
    private String roleTitle;
    private String status;
    private String jobDescription;

    public Long getUserId() {
        return userId;
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
}