package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.ApplicationAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationAnswerRepository
        extends JpaRepository<ApplicationAnswer, Long> {
    List<ApplicationAnswer> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<ApplicationAnswer> findByIdAndUserId(Long id, Long userId);
    void deleteByUserId(Long userId);
}
