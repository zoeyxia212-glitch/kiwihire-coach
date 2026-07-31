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
    private String careerLevel;
    private String employmentType;
    private Boolean graduateFriendly;
    private Boolean sponsorshipAvailable;
    private String industry;
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
        this(
                id,
                company,
                roleTitle,
                location,
                status,
                jobDescription,
                closingDate,
                createdAt,
                userId,
                userEmail,
                source,
                workMode,
                workRightsRequirement,
                salaryRange,
                contactPerson,
                jobUrl,
                null,
                null,
                null,
                null,
                null,
                archived
        );
    }

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
            String careerLevel,
            String employmentType,
            Boolean graduateFriendly,
            Boolean sponsorshipAvailable,
            String industry,
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
        this.careerLevel = careerLevel;
        this.employmentType = employmentType;
        this.graduateFriendly = graduateFriendly;
        this.sponsorshipAvailable = sponsorshipAvailable;
        this.industry = industry;
        this.archived = archived;
    }
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
        String userEmail
) {
    this(
            id,
            company,
            roleTitle,
            location,
            status,
            jobDescription,
            closingDate,
            createdAt,
            userId,
            userEmail,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            false
    );
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

    public String getCareerLevel() {
        return careerLevel;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public Boolean getGraduateFriendly() {
        return graduateFriendly;
    }

    public Boolean getSponsorshipAvailable() {
        return sponsorshipAvailable;
    }

    public String getIndustry() {
        return industry;
    }

    public boolean isArchived() {
        return archived;
    }
}
