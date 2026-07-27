package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateProfileRepository
        extends JpaRepository<CandidateProfile, Long> {

    Optional<CandidateProfile> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
