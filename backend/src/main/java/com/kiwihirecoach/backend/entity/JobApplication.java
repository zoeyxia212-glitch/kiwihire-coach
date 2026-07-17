package com.kiwihirecoach.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String company;
    private LocalDateTime createdAt;
    private LocalDate closingDate;
    private String roleTitle;

    private String status;

    private String jobDescription;

    @ManyToOne
    private User user;

    public JobApplication() {
    }

    public JobApplication(String company, String roleTitle, String status, String jobDescription, LocalDate closingDate, User user) {
        this.company = company;
        this.roleTitle = roleTitle;
        this.status = status;
        this.jobDescription = jobDescription;
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.closingDate = closingDate;

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

    public User getUser() {
        return user;
    }
    public LocalDateTime getCreatedAt() {
    return createdAt;
}
public void setCompany(String company) {
    this.company = company;
}

public void setRoleTitle(String roleTitle) {
    this.roleTitle = roleTitle;
}

public void setStatus(String status) {
    this.status = status;
}

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public LocalDate getClosingDate() {
        return closingDate;
    }

    public void setClosingDate(LocalDate closingDate) {
        this.closingDate = closingDate;
    }
}
