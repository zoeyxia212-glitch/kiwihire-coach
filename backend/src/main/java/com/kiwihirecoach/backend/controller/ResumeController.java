package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.ResumeResponse;
import com.kiwihirecoach.backend.dto.SaveResumeRequest;
import com.kiwihirecoach.backend.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {
    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public List<ResumeResponse> getResumes(
            Authentication authentication
    ) {
        return resumeService.getResumes(currentUserId(authentication));
    }

    @PostMapping
    public ResponseEntity<ResumeResponse> createResume(
            @Valid @RequestBody SaveResumeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resumeService.createResume(
                        request,
                        currentUserId(authentication)
                ));
    }

    @PutMapping("/{resumeId}")
    public ResumeResponse updateResume(
            @PathVariable Long resumeId,
            @Valid @RequestBody SaveResumeRequest request,
            Authentication authentication
    ) {
        return resumeService.updateResume(
                resumeId,
                request,
                currentUserId(authentication)
        );
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long resumeId,
            Authentication authentication
    ) {
        resumeService.deleteResume(
                resumeId,
                currentUserId(authentication)
        );
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
