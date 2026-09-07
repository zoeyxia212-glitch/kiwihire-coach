package com.kiwihirecoach.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.time.LocalDate;

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
    private String nextAction;
    private LocalDate targetDate;

    @Column(columnDefinition = "TEXT")
    private String outcomeEvidence;

    private LocalDateTime completedAt;
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
        this.nextAction = "";
        this.outcomeEvidence = "";
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

    public String getNextAction() {
        return nextAction;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public String getOutcomeEvidence() {
        return outcomeEvidence;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(String status) {
        this.status = status;
        if ("Completed".equals(status) && completedAt == null) {
            completedAt = LocalDateTime.now();
        } else if (!"Completed".equals(status)) {
            completedAt = null;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void setNextAction(String nextAction) {
        this.nextAction = nextAction;
        this.updatedAt = LocalDateTime.now();
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
        this.updatedAt = LocalDateTime.now();
    }

    public void setOutcomeEvidence(String outcomeEvidence) {
        this.outcomeEvidence = outcomeEvidence;
        this.updatedAt = LocalDateTime.now();
    }
}
