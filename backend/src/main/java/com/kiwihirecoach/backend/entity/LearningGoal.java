package com.kiwihirecoach.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_goals")
public class LearningGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    private String skill;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private String status;
    private Long sourceReviewId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LearningGoal() {
    }

    public LearningGoal(
            User user,
            String skill,
            String reason,
            Long sourceReviewId
    ) {
        this.user = user;
        this.skill = skill;
        this.reason = reason;
        this.sourceReviewId = sourceReviewId;
        this.status = "To learn";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getSkill() {
        return skill;
    }

    public String getReason() {
        return reason;
    }

    public String getStatus() {
        return status;
    }

    public Long getSourceReviewId() {
        return sourceReviewId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
}
