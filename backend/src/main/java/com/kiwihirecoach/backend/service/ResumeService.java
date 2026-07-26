package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.ResumeResponse;
import com.kiwihirecoach.backend.dto.SaveResumeRequest;
import com.kiwihirecoach.backend.entity.Resume;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.ResumeRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeReviewRepository resumeReviewRepository;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            ResumeReviewRepository resumeReviewRepository
    ) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeReviewRepository = resumeReviewRepository;
    }

    public List<ResumeResponse> getResumes(Long userId) {
        return resumeRepository
                .findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ResumeResponse createResume(
            SaveResumeRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));

        Resume resume = new Resume(
                request.name().trim(),
                normalizeOptional(request.purpose()),
                request.content().trim(),
                user
        );

        return toResponse(resumeRepository.save(resume));
    }

    public ResumeResponse updateResume(
            Long resumeId,
            SaveResumeRequest request,
            Long userId
    ) {
        Resume resume = findOwnedResume(resumeId, userId);
        resume.update(
                request.name().trim(),
                normalizeOptional(request.purpose()),
                request.content().trim()
        );

        return toResponse(resumeRepository.save(resume));
    }

    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = findOwnedResume(resumeId, userId);
        resumeReviewRepository.deleteByResumeId(resumeId);
        resumeRepository.delete(resume);
    }

    private Resume findOwnedResume(Long resumeId, Long userId) {
        return resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resume not found"
                ));
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private ResumeResponse toResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getName(),
                resume.getPurpose(),
                resume.getContent(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }
}
