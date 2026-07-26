package com.kiwihirecoach.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwihirecoach.backend.dto.CreateResumeReviewRequest;
import com.kiwihirecoach.backend.dto.ResumeReviewResponse;
import com.kiwihirecoach.backend.dto.ReviewAnalysisItem;
import com.kiwihirecoach.backend.dto.ReviewQuestion;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.entity.Resume;
import com.kiwihirecoach.backend.entity.ResumeReview;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.ResumeRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResumeReviewService {
    private final ResumeReviewRepository resumeReviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ResumeReviewService(
            ResumeReviewRepository resumeReviewRepository,
            JobApplicationRepository jobApplicationRepository,
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.resumeReviewRepository = resumeReviewRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public List<ResumeReviewResponse> getReviews(Long userId) {
        return resumeReviewRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ResumeReviewResponse getReview(Long reviewId, Long userId) {
        return toResponse(findOwnedReview(reviewId, userId));
    }

    public void deleteReview(Long reviewId, Long userId) {
        resumeReviewRepository.delete(
                findOwnedReview(reviewId, userId)
        );
    }

    public ResumeReviewResponse updateFeedback(
            Long reviewId,
            Boolean helpful,
            Long userId
    ) {
        ResumeReview review = findOwnedReview(reviewId, userId);
        review.setHelpful(helpful);
        return toResponse(resumeReviewRepository.save(review));
    }

    public ResumeReviewResponse updateAnswers(
            Long reviewId,
            List<String> answers,
            Long userId
    ) {
        ResumeReview review = findOwnedReview(reviewId, userId);
        review.setAnswersJson(writeJson(
                answers.stream()
                        .map(answer -> answer == null ? "" : answer.trim())
                        .toList()
        ));
        return toResponse(resumeReviewRepository.save(review));
    }

    public ResumeReviewResponse createReview(
            CreateResumeReviewRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));
        JobApplication application = jobApplicationRepository
                .findByIdAndUserId(request.applicationId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found"
                ));
        Resume resume = resumeRepository
                .findByIdAndUserId(request.resumeId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume not found"
                ));

        ResumeReview review = new ResumeReview(
                user,
                application,
                resume,
                request.score(),
                writeJson(request.matched()),
                writeJson(request.transferable()),
                writeJson(request.missing()),
                writeJson(request.suggestions()),
                writeJson(request.questions())
        );

        return toResponse(resumeReviewRepository.save(review));
    }

    private ResumeReview findOwnedReview(Long reviewId, Long userId) {
        return resumeReviewRepository
                .findByIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Review not found"
                ));
    }

    private ResumeReviewResponse toResponse(ResumeReview review) {
        return new ResumeReviewResponse(
                review.getId(),
                review.getApplication().getId(),
                review.getApplication().getCompany(),
                review.getApplication().getRoleTitle(),
                review.getResume().getId(),
                review.getResume().getName(),
                review.getScore(),
                readJson(
                        review.getMatchedJson(),
                        new TypeReference<List<ReviewAnalysisItem>>() {}
                ),
                readJson(
                        review.getTransferableJson(),
                        new TypeReference<List<ReviewAnalysisItem>>() {}
                ),
                readJson(
                        review.getMissingJson(),
                        new TypeReference<List<ReviewAnalysisItem>>() {}
                ),
                readJson(
                        review.getSuggestionsJson(),
                        new TypeReference<List<String>>() {}
                ),
                readJson(
                        review.getQuestionsJson(),
                        new TypeReference<List<ReviewQuestion>>() {}
                ),
                readJson(
                        review.getAnswersJson(),
                        new TypeReference<List<String>>() {}
                ),
                review.getHelpful(),
                review.getCreatedAt()
        );
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(
                    value == null ? List.of() : value
            );
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "Failed to save review results",
                    exception
            );
        }
    }

    private <T> T readJson(
            String json,
            TypeReference<T> typeReference
    ) {
        if (json == null || json.isBlank()) {
            try {
                return objectMapper.readValue("[]", typeReference);
            } catch (JsonProcessingException exception) {
                throw new IllegalStateException(
                        "Failed to create an empty review result",
                        exception
                );
            }
        }

        try {
            return objectMapper.readValue(json, typeReference);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "Failed to read review results",
                    exception
            );
        }
    }
}
