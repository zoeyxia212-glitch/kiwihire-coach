package com.kiwihirecoach.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateJobApplicationRequest {
    @NotBlank(message = "Company is required")
    @Size(max = 200, message = "Company must be 200 characters or fewer")
    private String company;

    @NotBlank(message = "Role title is required")
    @Size(max = 200, message = "Role title must be 200 characters or fewer")
    private String roleTitle;

    @Size(max = 200, message = "Location must be 200 characters or fewer")
    private String location;

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "Saved|Applied|Recruiter Screen|First Interview"
                    + "|Second Interview|Technical Interview"
                    + "|Reference Check|Offer|Rejected|Withdrawn",
            message = "Choose a valid application status"
    )
    private String status;

    @NotBlank(message = "Job description is required")
    @Size(
            max = 50000,
            message = "Job description must be 50000 characters or fewer"
    )
    private String jobDescription;

    @NotNull(message = "Closing date is required")
    private LocalDate closingDate;

    @Size(max = 100, message = "Source must be 100 characters or fewer")
    private String source;

    @Size(max = 50, message = "Work mode must be 50 characters or fewer")
    private String workMode;

    @Size(
            max = 200,
            message = "Work rights requirement must be 200 characters or fewer"
    )
    private String workRightsRequirement;

    @Size(max = 120, message = "Salary range must be 120 characters or fewer")
    private String salaryRange;

    @Size(max = 200, message = "Contact person must be 200 characters or fewer")
    private String contactPerson;

    @Size(max = 2000)
    @Pattern(
            regexp = "^$|^https?://.*$",
            message = "Job URL must start with http:// or https://"
    )
    private String jobUrl;

    @Pattern(
            regexp = "^$|Graduate|Junior|Intermediate|Senior|Lead",
            message = "Choose a valid career level"
    )
    private String careerLevel;

    @Pattern(
            regexp = "^$|Permanent|Fixed-term|Contract|Internship|Casual",
            message = "Choose a valid employment type"
    )
    private String employmentType;

    private Boolean graduateFriendly;

    private Boolean sponsorshipAvailable;

    @Size(max = 120, message = "Industry must be 120 characters or fewer")
    private String industry;

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
}
