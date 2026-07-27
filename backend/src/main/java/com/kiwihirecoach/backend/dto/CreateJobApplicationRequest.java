package com.kiwihirecoach.backend.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateJobApplicationRequest {
    private String company;
    private String roleTitle;
    private String location;
    private String status;
    private String jobDescription;
    private LocalDate closingDate;
    private String source;
    private String workMode;
    private String workRightsRequirement;
    private String salaryRange;
    private String contactPerson;

    @Size(max = 2000)
    @Pattern(
            regexp = "^$|^https?://.*$",
            message = "Job URL must start with http:// or https://"
    )
    private String jobUrl;

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
}
