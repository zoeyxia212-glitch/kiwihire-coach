package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.CreateResumeReviewRequest;
import com.kiwihirecoach.backend.dto.ResumeReviewResponse;
import com.kiwihirecoach.backend.dto.ReviewFeedbackRequest;
import com.kiwihirecoach.backend.dto.SaveReviewAnswersRequest;
import com.kiwihirecoach.backend.service.ResumeReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ResumeReviewController {
    private final ResumeReviewService resumeReviewService;

    public ResumeReviewController(
            ResumeReviewService resumeReviewService
    ) {
        this.resumeReviewService = resumeReviewService;
    }

    @GetMapping
    public List<ResumeReviewResponse> getReviews(
            Authentication authentication
    ) {
        return resumeReviewService.getReviews(
                (Long) authentication.getPrincipal()
        );
    }

    @GetMapping("/{reviewId}")
    public ResumeReviewResponse getReview(
            @PathVariable Long reviewId,
            Authentication authentication
    ) {
        return resumeReviewService.getReview(
                reviewId,
                (Long) authentication.getPrincipal()
        );
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication
    ) {
        resumeReviewService.deleteReview(
                reviewId,
                (Long) authentication.getPrincipal()
        );
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{reviewId}/feedback")
    public ResumeReviewResponse updateFeedback(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewFeedbackRequest request,
            Authentication authentication
    ) {
        return resumeReviewService.updateFeedback(
                reviewId,
                request.helpful(),
                (Long) authentication.getPrincipal()
        );
    }

    @PatchMapping("/{reviewId}/answers")
    public ResumeReviewResponse updateAnswers(
            @PathVariable Long reviewId,
            @Valid @RequestBody SaveReviewAnswersRequest request,
            Authentication authentication
    ) {
        return resumeReviewService.updateAnswers(
                reviewId,
                request.answers(),
                (Long) authentication.getPrincipal()
        );
    }

    @PostMapping
    public ResponseEntity<ResumeReviewResponse> createReview(
            @Valid @RequestBody CreateResumeReviewRequest request,
            Authentication authentication
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resumeReviewService.createReview(
                        request,
                        (Long) authentication.getPrincipal()
                ));
    }
}
