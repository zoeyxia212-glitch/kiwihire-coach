package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.CandidateProfileResponse;
import com.kiwihirecoach.backend.dto.SaveCandidateProfileRequest;
import com.kiwihirecoach.backend.service.CandidateProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class CandidateProfileController {
    private final CandidateProfileService candidateProfileService;

    public CandidateProfileController(
            CandidateProfileService candidateProfileService
    ) {
        this.candidateProfileService = candidateProfileService;
    }

    @GetMapping
    public CandidateProfileResponse getProfile(
            Authentication authentication
    ) {
        return candidateProfileService.getProfile(
                (Long) authentication.getPrincipal()
        );
    }

    @PutMapping
    public CandidateProfileResponse saveProfile(
            @Valid @RequestBody SaveCandidateProfileRequest request,
            Authentication authentication
    ) {
        return candidateProfileService.saveProfile(
                request,
                (Long) authentication.getPrincipal()
        );
    }
}
