package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.ProductFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductFeedbackRepository
        extends JpaRepository<ProductFeedback, Long> {

    List<ProductFeedback> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);
}
