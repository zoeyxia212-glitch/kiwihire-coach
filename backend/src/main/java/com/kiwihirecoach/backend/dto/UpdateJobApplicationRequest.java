package com.kiwihirecoach.backend.dto;

import java.time.LocalDate;

public class UpdateJobApplicationRequest {
    private String company;
    private String roleTitle;
    private String location;
    private String status;
    private String jobDescription;
    private LocalDate closingDate;

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

    public LocalDate getClosingDate() {
        return closingDate;
    }
}
