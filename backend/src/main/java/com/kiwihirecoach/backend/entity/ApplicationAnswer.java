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
@Table(name = "application_answers")
public class ApplicationAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @Column(length = 500, nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answer;

    private String tags;
    private String roleTypes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApplicationAnswer() {
    }

    public ApplicationAnswer(
            User user,
            String question,
            String answer,
            String tags,
            String roleTypes
    ) {
        this.user = user;
        this.createdAt = LocalDateTime.now();
        update(question, answer, tags, roleTypes);
    }

    public void update(String question, String answer, String tags, String roleTypes) {
        this.question = question;
        this.answer = answer;
        this.tags = tags;
        this.roleTypes = roleTypes;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getQuestion() { return question; }
    public String getAnswer() { return answer; }
    public String getTags() { return tags; }
    public String getRoleTypes() { return roleTypes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
