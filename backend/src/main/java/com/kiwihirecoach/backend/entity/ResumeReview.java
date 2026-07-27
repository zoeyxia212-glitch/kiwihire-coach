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
@Table(name = "resume_reviews")
public class ResumeReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private JobApplication application;

    @ManyToOne(optional = false)
    private Resume resume;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String matchedJson;

    @Column(columnDefinition = "TEXT")
    private String transferableJson;

    @Column(columnDefinition = "TEXT")
    private String missingJson;

    @Column(columnDefinition = "TEXT")
    private String suggestionsJson;

    @Column(columnDefinition = "TEXT")
    private String suggestionStatusesJson;

    @Column(columnDefinition = "TEXT")
    private String questionsJson;

    @Column(columnDefinition = "TEXT")
    private String answersJson;

    @Column(columnDefinition = "TEXT")
    private String answerStatusesJson;

    private Boolean helpful;

    @Column(length = 2000)
    private String feedbackComment;

    private String workflowIntent;

    private LocalDateTime createdAt;

    public ResumeReview() {
    }

    public ResumeReview(
            User user,
            JobApplication application,
            Resume resume,
            Integer score,
            String matchedJson,
            String transferableJson,
            String missingJson,
            String suggestionsJson,
            String questionsJson
    ) {
        this.user = user;
        this.application = application;
        this.resume = resume;
        this.score = score;
        this.matchedJson = matchedJson;
        this.transferableJson = transferableJson;
        this.missingJson = missingJson;
        this.suggestionsJson = suggestionsJson;
        this.suggestionStatusesJson = "[]";
        this.questionsJson = questionsJson;
        this.answersJson = "[]";
        this.answerStatusesJson = "[]";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public JobApplication getApplication() {
        return application;
    }

    public Resume getResume() {
        return resume;
    }

    public Integer getScore() {
        return score;
    }

    public String getMatchedJson() {
        return matchedJson;
    }

    public String getTransferableJson() {
        return transferableJson;
    }

    public String getMissingJson() {
        return missingJson;
    }

    public String getSuggestionsJson() {
        return suggestionsJson;
    }

    public String getSuggestionStatusesJson() {
        return suggestionStatusesJson;
    }

    public void setSuggestionStatusesJson(String suggestionStatusesJson) {
        this.suggestionStatusesJson = suggestionStatusesJson;
    }

    public String getQuestionsJson() {
        return questionsJson;
    }

    public String getAnswersJson() {
        return answersJson;
    }

    public void setAnswersJson(String answersJson) {
        this.answersJson = answersJson;
    }

    public String getAnswerStatusesJson() {
        return answerStatusesJson;
    }

    public void setAnswerStatusesJson(String answerStatusesJson) {
        this.answerStatusesJson = answerStatusesJson;
    }

    public Boolean getHelpful() {
        return helpful;
    }

    public void setHelpful(Boolean helpful) {
        this.helpful = helpful;
    }

    public String getFeedbackComment() {
        return feedbackComment;
    }

    public void setFeedbackComment(String feedbackComment) {
        this.feedbackComment = feedbackComment;
    }

    public String getWorkflowIntent() {
        return workflowIntent;
    }

    public void setWorkflowIntent(String workflowIntent) {
        this.workflowIntent = workflowIntent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
