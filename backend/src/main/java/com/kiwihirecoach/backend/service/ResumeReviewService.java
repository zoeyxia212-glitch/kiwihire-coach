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
import java.util.ArrayList;

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
            String comment,
            String workflowIntent,
            Long userId
    ) {
        ResumeReview review = findOwnedReview(reviewId, userId);
        review.setHelpful(helpful);
        review.setFeedbackComment(
                comment == null || comment.isBlank()
                        ? null
                        : comment.trim()
        );
        review.setWorkflowIntent(workflowIntent);
        return toResponse(resumeReviewRepository.save(review));
    }

    public ResumeReviewResponse updateAnswers(
            Long reviewId,
            List<String> answers,
            Long userId
    ) {
        ResumeReview review = findOwnedReview(reviewId, userId);
        List<String> normalizedAnswers = answers.stream()
                .map(answer -> answer == null ? "" : answer.trim())
                .toList();
        List<String> currentStatuses = readJson(
                review.getAnswerStatusesJson(),
                new TypeReference<List<String>>() {}
        );
        List<String> nextStatuses = new ArrayList<>();

        for (int index = 0; index < normalizedAnswers.size(); index++) {
            String answer = normalizedAnswers.get(index);
            String currentStatus = index < currentStatuses.size()
                    ? currentStatuses.get(index)
                    : "Not started";

            nextStatuses.add(
                    answer.isBlank()
                            ? "Not started"
                            : "Ready".equals(currentStatus)
                            ? "Ready"
                            : "Drafted"
            );
        }

        review.setAnswersJson(writeJson(normalizedAnswers));
        review.setAnswerStatusesJson(writeJson(nextStatuses));
        return toResponse(resumeReviewRepository.save(review));
    }

    public ResumeReviewResponse updateAnswerStatus(
            Long reviewId,
            int questionIndex,
            String status,
            Long userId
    ) {
        ResumeReview review = findOwnedReview(reviewId, userId);
        List<ReviewQuestion> questions = readJson(
                review.getQuestionsJson(),
                new TypeReference<List<ReviewQuestion>>() {}
        );

        if (questionIndex >= questions.size()) {
            throw new IllegalArgumentException(
                    "Interview question not found"
            );
        }

        List<String> statuses = new ArrayList<>(readJson(
                review.getAnswerStatusesJson(),
                new TypeReference<List<String>>() {}
        ));
        while (statuses.size() < questions.size()) {
            statuses.add("Not started");
        }
        statuses.set(questionIndex, status);
        review.setAnswerStatusesJson(writeJson(statuses));

        return toResponse(resumeReviewRepository.save(review));
    }

    public ResumeReviewResponse updateSuggestionStatus(
            Long reviewId,
            int suggestionIndex,
            String status,
            Long userId
    ) {
        ResumeReview review = findOwnedReview(reviewId, userId);
        List<String> suggestions = readJson(
                review.getSuggestionsJson(),
                new TypeReference<List<String>>() {}
        );

        if (suggestionIndex >= suggestions.size()) {
            throw new IllegalArgumentException(
                    "Resume suggestion not found"
            );
        }

        List<String> statuses = new ArrayList<>(readJson(
                review.getSuggestionStatusesJson(),
                new TypeReference<List<String>>() {}
        ));
        while (statuses.size() < suggestions.size()) {
            statuses.add("To do");
        }
        statuses.set(suggestionIndex, status);
        review.setSuggestionStatusesJson(writeJson(statuses));

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
                normalizedSuggestionStatuses(review),
                readJson(
                        review.getQuestionsJson(),
                        new TypeReference<List<ReviewQuestion>>() {}
                ),
                readJson(
                        review.getAnswersJson(),
                        new TypeReference<List<String>>() {}
                ),
                readJson(
                        review.getAnswerStatusesJson(),
                        new TypeReference<List<String>>() {}
                ),
                review.getHelpful(),
                review.getFeedbackComment(),
                review.getWorkflowIntent(),
                review.getCreatedAt()
        );
    }

    private List<String> normalizedSuggestionStatuses(
            ResumeReview review
    ) {
        List<String> suggestions = readJson(
                review.getSuggestionsJson(),
                new TypeReference<List<String>>() {}
        );
        List<String> savedStatuses = readJson(
                review.getSuggestionStatusesJson(),
                new TypeReference<List<String>>() {}
        );
        List<String> statuses = new ArrayList<>();

        for (int index = 0; index < suggestions.size(); index++) {
            statuses.add(
                    index < savedStatuses.size()
                            ? savedStatuses.get(index)
                            : "To do"
            );
        }

        return statuses;
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
