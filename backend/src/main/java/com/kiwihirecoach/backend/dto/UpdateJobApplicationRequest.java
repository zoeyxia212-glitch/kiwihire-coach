package com.kiwihirecoach.backend.dto;

public class UpdateJobApplicationRequest {
    private String company;
    private String roleTitle;
    private String location;
    private String status;
    private String jobDescription;

    public String getCompany() {
        return company;
    }

    public String getRoleTitle() {
        return roleTitle;
    }

    public String getLocation() {
        return location;
    }

    public String getStatus() {
        return status;
    }

    public String getJobDescription() {
        return jobDescription;
    }
}
