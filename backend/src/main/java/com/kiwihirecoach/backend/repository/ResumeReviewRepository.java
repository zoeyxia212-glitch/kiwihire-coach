package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.ResumeReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeReviewRepository
        extends JpaRepository<ResumeReview, Long> {

    List<ResumeReview> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ResumeReview> findByIdAndUserId(Long id, Long userId);

    void deleteByApplicationId(Long applicationId);

    void deleteByResumeId(Long resumeId);

    void deleteByUserId(Long userId);
}
