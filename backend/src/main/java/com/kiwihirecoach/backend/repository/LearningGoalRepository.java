package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.LearningGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningGoalRepository
        extends JpaRepository<LearningGoal, Long> {

    List<LearningGoal> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<LearningGoal> findByIdAndUserId(Long id, Long userId);

    Optional<LearningGoal> findByUserIdAndSkillIgnoreCase(
            Long userId,
            String skill
    );

    void deleteByUserId(Long userId);
}
