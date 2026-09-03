package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.EvidenceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvidenceItemRepository
        extends JpaRepository<EvidenceItem, Long> {
    List<EvidenceItem> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<EvidenceItem> findByIdAndUserId(Long id, Long userId);
    void deleteByUserId(Long userId);
}
