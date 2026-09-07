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
@Table(name = "evidence_items")
public class EvidenceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    private String title;
    private String context;

    @Column(columnDefinition = "TEXT")
    private String action;

    @Column(columnDefinition = "TEXT")
    private String result;

    private String skills;
    private Long sourceLearningGoalId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EvidenceItem() {
    }

    public EvidenceItem(
            User user,
            String title,
            String context,
            String action,
            String result,
            String skills
    ) {
        this.user = user;
        this.createdAt = LocalDateTime.now();
        update(title, context, action, result, skills);
    }

    public void update(
            String title,
            String context,
            String action,
            String result,
            String skills
    ) {
        this.title = title;
        this.context = context;
        this.action = action;
        this.result = result;
        this.skills = skills;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContext() { return context; }
    public String getAction() { return action; }
    public String getResult() { return result; }
    public String getSkills() { return skills; }
    public Long getSourceLearningGoalId() { return sourceLearningGoalId; }
    public void setSourceLearningGoalId(Long sourceLearningGoalId) {
        this.sourceLearningGoalId = sourceLearningGoalId;
    }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
