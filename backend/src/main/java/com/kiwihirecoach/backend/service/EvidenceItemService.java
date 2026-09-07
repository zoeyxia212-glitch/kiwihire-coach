package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.EvidenceItemResponse;
import com.kiwihirecoach.backend.dto.SaveEvidenceItemRequest;
import com.kiwihirecoach.backend.entity.EvidenceItem;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.EvidenceItemRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.LearningGoalRepository;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.entity.LearningGoal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvidenceItemService {
    private final EvidenceItemRepository evidenceItemRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final LearningGoalRepository learningGoalRepository;

    public EvidenceItemService(
            EvidenceItemRepository evidenceItemRepository,
            UserRepository userRepository,
            JobApplicationRepository jobApplicationRepository,
            LearningGoalRepository learningGoalRepository
    ) {
        this.evidenceItemRepository = evidenceItemRepository;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.learningGoalRepository = learningGoalRepository;
    }

    public EvidenceItemResponse createFromLearningGoal(
            Long goalId,
            Long userId
    ) {
        var existing = evidenceItemRepository
                .findByUserIdAndSourceLearningGoalId(userId, goalId);
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        LearningGoal goal = learningGoalRepository
                .findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Learning goal not found"
                ));
        if (!"Completed".equals(goal.getStatus())) {
            throw new IllegalArgumentException(
                    "Complete the learning goal before adding it as evidence."
            );
        }
        if (cleanNullable(goal.getOutcomeEvidence()).isBlank()) {
            throw new IllegalArgumentException(
                    "Add learning evidence or an outcome first."
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        EvidenceItem item = new EvidenceItem(
                user,
                "Learning outcome: " + goal.getSkill(),
                cleanNullable(goal.getReason()).isBlank()
                        ? "Built capability for target software roles."
                        : cleanNullable(goal.getReason()),
                cleanNullable(goal.getNextAction()).isBlank()
                        ? "Completed practical learning and documented the work."
                        : cleanNullable(goal.getNextAction()),
                cleanNullable(goal.getOutcomeEvidence()),
                goal.getSkill()
        );
        item.setSourceLearningGoalId(goalId);
        return toResponse(evidenceItemRepository.save(item));
    }

    public List<EvidenceItemResponse> getItems(Long userId) {
        return evidenceItemRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EvidenceItemResponse createItem(
            SaveEvidenceItemRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        EvidenceItem item = new EvidenceItem(
                user,
                clean(request.title()),
                clean(request.context()),
                clean(request.action()),
                clean(request.result()),
                clean(request.skills())
        );
        return toResponse(evidenceItemRepository.save(item));
    }

    public EvidenceItemResponse updateItem(
            Long itemId,
            SaveEvidenceItemRequest request,
            Long userId
    ) {
        EvidenceItem item = findOwnedItem(itemId, userId);
        item.update(
                clean(request.title()),
                clean(request.context()),
                clean(request.action()),
                clean(request.result()),
                clean(request.skills())
        );
        return toResponse(evidenceItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long itemId, Long userId) {
        EvidenceItem item = findOwnedItem(itemId, userId);
        List<JobApplication> applications =
                jobApplicationRepository.findByEvidenceItemsId(itemId);
        applications.forEach(application -> {
            application.getEvidenceItems().remove(item);
            jobApplicationRepository.save(application);
        });
        evidenceItemRepository.delete(item);
    }

    private EvidenceItem findOwnedItem(Long itemId, Long userId) {
        return evidenceItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Evidence item not found"
                ));
    }

    private String clean(String value) {
        return value.trim();
    }

    private String cleanNullable(String value) {
        return value == null ? "" : value.trim();
    }

    private EvidenceItemResponse toResponse(EvidenceItem item) {
        return new EvidenceItemResponse(
                item.getId(),
                item.getTitle(),
                item.getContext(),
                item.getAction(),
                item.getResult(),
                item.getSkills(),
                item.getSourceLearningGoalId(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
