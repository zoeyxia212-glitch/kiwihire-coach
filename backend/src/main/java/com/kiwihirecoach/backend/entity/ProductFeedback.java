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
@Table(name = "product_feedback")
public class ProductFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    private String category;
    private int rating;

    @Column(length = 500)
    private String page;
    private Boolean wouldUseAgain;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime createdAt;

    public ProductFeedback() {
    }

    public ProductFeedback(
            User user,
            String category,
            int rating,
            String page,
            Boolean wouldUseAgain,
            String message
    ) {
        this.user = user;
        this.category = category;
        this.rating = rating;
        this.page = page;
        this.wouldUseAgain = wouldUseAgain;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getCategory() {
        return category;
    }

    public int getRating() {
        return rating;
    }

    public String getPage() {
        return page;
    }

    public String getMessage() {
        return message;
    }

    public Boolean getWouldUseAgain() {
        return wouldUseAgain;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
