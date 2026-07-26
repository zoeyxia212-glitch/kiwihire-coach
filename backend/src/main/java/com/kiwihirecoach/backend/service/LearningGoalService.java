package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.CreateLearningGoalRequest;
import com.kiwihirecoach.backend.dto.LearningGoalResponse;
import com.kiwihirecoach.backend.dto.UpdateLearningGoalRequest;
import com.kiwihirecoach.backend.entity.LearningGoal;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.LearningGoalRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningGoalService {
    private final LearningGoalRepository learningGoalRepository;
    private final ResumeReviewRepository resumeReviewRepository;
    private final UserRepository userRepository;

    public LearningGoalService(
            LearningGoalRepository learningGoalRepository,
            ResumeReviewRepository resumeReviewRepository,
            UserRepository userRepository
    ) {
        this.learningGoalRepository = learningGoalRepository;
        this.resumeReviewRepository = resumeReviewRepository;
        this.userRepository = userRepository;
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

        if (learningGoalRepository.existsByUserIdAndSkillIgnoreCase(
                userId,
                request.skill().trim()
        )) {
            return learningGoalRepository
                    .findByUserIdOrderByUpdatedAtDesc(userId)
                    .stream()
                    .filter(goal -> goal.getSkill().equalsIgnoreCase(
                            request.skill().trim()
                    ))
                    .findFirst()
                    .map(this::toResponse)
                    .orElseThrow();
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

    private LearningGoalResponse toResponse(LearningGoal goal) {
        return new LearningGoalResponse(
                goal.getId(),
                goal.getSkill(),
                goal.getReason(),
                goal.getStatus(),
                goal.getSourceReviewId(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }
}
