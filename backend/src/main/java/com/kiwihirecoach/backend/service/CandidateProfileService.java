package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.CandidateProfileResponse;
import com.kiwihirecoach.backend.dto.SaveCandidateProfileRequest;
import com.kiwihirecoach.backend.entity.CandidateProfile;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.CandidateProfileRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CandidateProfileService {
    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    public CandidateProfileService(
            CandidateProfileRepository candidateProfileRepository,
            UserRepository userRepository
    ) {
        this.candidateProfileRepository = candidateProfileRepository;
        this.userRepository = userRepository;
    }

    public CandidateProfileResponse getProfile(Long userId) {
        return candidateProfileRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElse(new CandidateProfileResponse(
                        null,
                        "",
                        "",
                        "",
                        "",
                        "",
                        null
                ));
    }

    public CandidateProfileResponse saveProfile(
            SaveCandidateProfileRequest request,
            Long userId
    ) {
        CandidateProfile profile = candidateProfileRepository
                .findByUserId(userId)
                .orElseGet(() -> new CandidateProfile(
                        findUser(userId),
                        "",
                        "",
                        "",
                        "",
                        ""
                ));

        profile.update(
                normalize(request.targetRoles()),
                normalize(request.workRights()),
                normalize(request.preferredLocations()),
                normalize(request.technicalSkills()),
                normalize(request.experienceSummary())
        );

        return toResponse(candidateProfileRepository.save(profile));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private CandidateProfileResponse toResponse(
            CandidateProfile profile
    ) {
        return new CandidateProfileResponse(
                profile.getId(),
                profile.getTargetRoles(),
                profile.getWorkRights(),
                profile.getPreferredLocations(),
                profile.getTechnicalSkills(),
                profile.getExperienceSummary(),
                profile.getUpdatedAt()
        );
    }
}
