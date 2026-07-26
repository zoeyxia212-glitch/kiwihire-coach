package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserId(Long userId);
    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
    List<JobApplication> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}
