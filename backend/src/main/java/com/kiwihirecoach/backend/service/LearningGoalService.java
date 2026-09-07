package com.kiwihirecoach.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwihirecoach.backend.dto.CreateLearningGoalRequest;
import com.kiwihirecoach.backend.dto.LearningGoalResponse;
import com.kiwihirecoach.backend.dto.ReviewAnalysisItem;
import com.kiwihirecoach.backend.dto.SkillGapInsightResponse;
import com.kiwihirecoach.backend.dto.UpdateLearningGoalRequest;
import com.kiwihirecoach.backend.entity.LearningGoal;
import com.kiwihirecoach.backend.entity.ResumeReview;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.LearningGoalRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class LearningGoalService {
    private final LearningGoalRepository learningGoalRepository;
    private final ResumeReviewRepository resumeReviewRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public LearningGoalService(
            LearningGoalRepository learningGoalRepository,
            ResumeReviewRepository resumeReviewRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.learningGoalRepository = learningGoalRepository;
        this.resumeReviewRepository = resumeReviewRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public List<SkillGapInsightResponse> getSkillGaps(Long userId) {
        List<ResumeReview> reviews = resumeReviewRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
        Map<String, LearningGoal> goalsBySkill = new HashMap<>();
        learningGoalRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .forEach(goal -> goalsBySkill.put(
                        normalizeSkill(goal.getSkill()),
                        goal
                ));

        Set<Long> reviewedApplications = new HashSet<>();
        Map<String, GapSummary> summaries = new LinkedHashMap<>();

        for (ResumeReview review : reviews) {
            Long applicationId = review.getApplication().getId();
            if (!reviewedApplications.add(applicationId)) {
                continue;
            }

            String role = review.getApplication().getCompany()
                    + " · " + review.getApplication().getRoleTitle();
            Set<String> skillsInReview = new HashSet<>();
            for (ReviewAnalysisItem item : readMissingSkills(review)) {
                String skill = normalize(item.skill());
                String key = normalizeSkill(skill);
                if (skill.isBlank() || !skillsInReview.add(key)) {
                    continue;
                }

                GapSummary summary = summaries.computeIfAbsent(
                        key,
                        ignored -> new GapSummary(skill, review.getId())
                );
                summary.applicationCount++;
                if (summary.exampleRoles.size() < 3) {
                    summary.exampleRoles.add(role);
                }
            }
        }

        return summaries.entrySet().stream()
                .map(entry -> {
                    GapSummary summary = entry.getValue();
                    LearningGoal goal = goalsBySkill.get(entry.getKey());
                    return new SkillGapInsightResponse(
                            summary.skill,
                            summary.applicationCount,
                            List.copyOf(summary.exampleRoles),
                            summary.sourceReviewId,
                            goal == null ? null : goal.getId(),
                            goal == null ? null : goal.getStatus()
                    );
                })
                .sorted(Comparator
                        .comparingInt(SkillGapInsightResponse::applicationCount)
                        .reversed()
                        .thenComparing(SkillGapInsightResponse::skill))
                .toList();
    }

    public List<LearningGoalResponse> getGoals(Long userId) {
        return learningGoalRepository
                .findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public LearningGoalResponse createGoal(
            CreateLearningGoalRequest request,
            Long userId
    ) {
        if (request.sourceReviewId() != null) {
            resumeReviewRepository
                    .findByIdAndUserId(request.sourceReviewId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Review not found"
                    ));
        }

        var existingGoal = learningGoalRepository
                .findByUserIdAndSkillIgnoreCase(
                        userId,
                        request.skill().trim()
                );
        if (existingGoal.isPresent()) {
            return toResponse(existingGoal.get());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));
        LearningGoal goal = new LearningGoal(
                user,
                request.skill().trim(),
                normalize(request.reason()),
                request.sourceReviewId()
        );

        return toResponse(learningGoalRepository.save(goal));
    }

    public LearningGoalResponse updateGoal(
            Long goalId,
            UpdateLearningGoalRequest request,
            Long userId
    ) {
        LearningGoal goal = findOwnedGoal(goalId, userId);
        goal.setStatus(request.status());
        goal.setNextAction(normalize(request.nextAction()));
        goal.setTargetDate(request.targetDate());
        goal.setOutcomeEvidence(normalize(request.outcomeEvidence()));
        return toResponse(learningGoalRepository.save(goal));
    }

    public void deleteGoal(Long goalId, Long userId) {
        learningGoalRepository.delete(findOwnedGoal(goalId, userId));
    }

    private LearningGoal findOwnedGoal(Long goalId, Long userId) {
        return learningGoalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Learning goal not found"
                ));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeSkill(String skill) {
        return normalize(skill).toLowerCase(Locale.ROOT);
    }

    private List<ReviewAnalysisItem> readMissingSkills(ResumeReview review) {
        try {
            return objectMapper.readValue(
                    review.getMissingJson(),
                    new TypeReference<List<ReviewAnalysisItem>>() { }
            );
        } catch (JsonProcessingException exception) {
            return List.of();
        }
    }

    private static class GapSummary {
        private final String skill;
        private final Long sourceReviewId;
        private final List<String> exampleRoles = new ArrayList<>();
        private int applicationCount;

        private GapSummary(String skill, Long sourceReviewId) {
            this.skill = skill;
            this.sourceReviewId = sourceReviewId;
        }
    }

    private LearningGoalResponse toResponse(LearningGoal goal) {
        return new LearningGoalResponse(
                goal.getId(),
                goal.getSkill(),
                goal.getReason(),
                goal.getStatus(),
                normalize(goal.getNextAction()),
                goal.getTargetDate(),
                normalize(goal.getOutcomeEvidence()),
                goal.getCompletedAt(),
                goal.getSourceReviewId(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
