package com.kiwihirecoach.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobApplicationResponse {
    private Long id;
    private String company;
    private String roleTitle;
    private String location;
    private String status;
    private String jobDescription;
    private LocalDate closingDate;
    private LocalDateTime createdAt;
    private Long userId;
    private String userEmail;
    private String source;
    private String workMode;
    private String workRightsRequirement;
    private String salaryRange;
    private String contactPerson;
    private String jobUrl;
    private boolean archived;

    public JobApplicationResponse(
            Long id,
            String company,
            String roleTitle,
            String location,
            String status,
            String jobDescription,
            LocalDate closingDate,
            LocalDateTime createdAt,
            Long userId,
            String userEmail,
            String source,
            String workMode,
            String workRightsRequirement,
            String salaryRange,
            String contactPerson,
            String jobUrl,
            boolean archived
    ) {
        this.id = id;
        this.company = company;
        this.roleTitle = roleTitle;
        this.location = location;
        this.status = status;
        this.jobDescription = jobDescription;
        this.closingDate = closingDate;
        this.createdAt = createdAt;
        this.userId = userId;
        this.userEmail = userEmail;
        this.source = source;
        this.workMode = workMode;
        this.workRightsRequirement = workRightsRequirement;
        this.salaryRange = salaryRange;
        this.contactPerson = contactPerson;
        this.jobUrl = jobUrl;
        this.archived = archived;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getSource() {
        return source;
    }

    public String getWorkMode() {
        return workMode;
    }

    public String getWorkRightsRequirement() {
        return workRightsRequirement;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public boolean isArchived() {
        return archived;
    }
}
