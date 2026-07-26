package com.kiwihirecoach.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_profiles")
public class CandidateProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String targetRoles;
    private String workRights;
    private String preferredLocations;
    private String technicalSkills;

    @Column(columnDefinition = "TEXT")
    private String experienceSummary;

    private LocalDateTime updatedAt;

    public CandidateProfile() {
    }

    public CandidateProfile(
            User user,
            String targetRoles,
            String workRights,
            String preferredLocations,
            String technicalSkills,
            String experienceSummary
    ) {
        this.user = user;
        update(
                targetRoles,
                workRights,
                preferredLocations,
                technicalSkills,
                experienceSummary
        );
    }

    public void update(
            String targetRoles,
            String workRights,
            String preferredLocations,
            String technicalSkills,
            String experienceSummary
    ) {
        this.targetRoles = targetRoles;
        this.workRights = workRights;
        this.preferredLocations = preferredLocations;
        this.technicalSkills = technicalSkills;
        this.experienceSummary = experienceSummary;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTargetRoles() {
        return targetRoles;
    }

    public String getWorkRights() {
        return workRights;
    }

    public String getPreferredLocations() {
        return preferredLocations;
    }

    public String getTechnicalSkills() {
        return technicalSkills;
    }

    public String getExperienceSummary() {
        return experienceSummary;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
