package com.kiwihirecoach.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_events")
public class ApplicationEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private JobApplication application;

    private String stage;
    private LocalDateTime occurredAt;
    private String contactPerson;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String nextAction;
    private LocalDate followUpDueDate;
    private boolean completed;
    private LocalDateTime createdAt;

    public ApplicationEvent() {
    }

    public ApplicationEvent(
            JobApplication application,
            String stage,
            LocalDateTime occurredAt,
            String contactPerson,
            String notes,
            String nextAction,
            LocalDate followUpDueDate
    ) {
        this.application = application;
        this.stage = stage;
        this.occurredAt = occurredAt;
        this.contactPerson = contactPerson;
        this.notes = notes;
        this.nextAction = nextAction;
        this.followUpDueDate = followUpDueDate;
        this.completed = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public JobApplication getApplication() {
        return application;
    }

    public String getStage() {
        return stage;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public String getNotes() {
        return notes;
    }

    public String getNextAction() {
        return nextAction;
    }

    public LocalDate getFollowUpDueDate() {
        return followUpDueDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public void setOccurredAt(LocalDateTime occurredAt) {
        this.occurredAt = occurredAt;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setNextAction(String nextAction) {
        this.nextAction = nextAction;
    }

    public void setFollowUpDueDate(LocalDate followUpDueDate) {
        this.followUpDueDate = followUpDueDate;
    }
}
