package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.CreateLearningGoalRequest;
import com.kiwihirecoach.backend.dto.LearningGoalResponse;
import com.kiwihirecoach.backend.dto.UpdateLearningGoalRequest;
import com.kiwihirecoach.backend.service.LearningGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/learning-goals")
public class LearningGoalController {
    private final LearningGoalService learningGoalService;

    public LearningGoalController(
            LearningGoalService learningGoalService
    ) {
        this.learningGoalService = learningGoalService;
    }

    @GetMapping
    public List<LearningGoalResponse> getGoals(
            Authentication authentication
    ) {
        return learningGoalService.getGoals(currentUserId(authentication));
    }

    @PostMapping
    public ResponseEntity<LearningGoalResponse> createGoal(
            @Valid @RequestBody CreateLearningGoalRequest request,
            Authentication authentication
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(learningGoalService.createGoal(
                        request,
                        currentUserId(authentication)
                ));
    }

    @PatchMapping("/{goalId}")
    public LearningGoalResponse updateGoal(
            @PathVariable Long goalId,
            @Valid @RequestBody UpdateLearningGoalRequest request,
            Authentication authentication
    ) {
        return learningGoalService.updateGoal(
                goalId,
                request,
                currentUserId(authentication)
        );
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long goalId,
            Authentication authentication
    ) {
        learningGoalService.deleteGoal(
                goalId,
                currentUserId(authentication)
        );
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
