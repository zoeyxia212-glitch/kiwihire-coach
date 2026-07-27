package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.ApplicationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface ApplicationEventRepository
        extends JpaRepository<ApplicationEvent, Long> {

    List<ApplicationEvent> findByApplicationIdOrderByOccurredAtDesc(
            Long applicationId
    );

    Optional<ApplicationEvent> findByIdAndApplicationUserId(
            Long id,
            Long userId
    );

    Optional<ApplicationEvent> findTopByApplicationIdOrderByOccurredAtDesc(
            Long applicationId
    );

    List<ApplicationEvent>
    findByApplicationUserIdAndCompletedFalseAndFollowUpDueDateIsNotNullOrderByFollowUpDueDateAsc(
            Long userId
    );

    void deleteByApplicationId(Long applicationId);

    void deleteByApplicationUserId(Long userId);

    List<ApplicationEvent>
    findByApplicationUserIdAndOccurredAtBetweenOrderByOccurredAtAsc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
}
