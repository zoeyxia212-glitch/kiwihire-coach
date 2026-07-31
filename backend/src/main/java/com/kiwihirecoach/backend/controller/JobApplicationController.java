package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.CreateJobApplicationRequest;
import com.kiwihirecoach.backend.dto.JobApplicationResponse;
import com.kiwihirecoach.backend.dto.UpdateJobApplicationRequest;
import com.kiwihirecoach.backend.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationService jobApplicationService;

    public JobApplicationController(
            JobApplicationService jobApplicationService
    ) {
        this.jobApplicationService = jobApplicationService;
    }

    @GetMapping
    public List<JobApplicationResponse> getApplications(
            Authentication authentication
    ) {
        return jobApplicationService.getApplicationsForUser(
                currentUserId(authentication)
        );
    }

    @GetMapping("/{id}")
    public JobApplicationResponse getApplicationById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return jobApplicationService.getApplicationById(
                id,
                currentUserId(authentication)
        );
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> createApplication(
            @Valid @RequestBody CreateJobApplicationRequest request,
            Authentication authentication
    ) {
        JobApplicationResponse response =
                jobApplicationService.createApplication(
                        request,
                        currentUserId(authentication)
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}")
    public JobApplicationResponse updateApplication(
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobApplicationRequest request,
            Authentication authentication
    ) {
        return jobApplicationService.updateApplication(
                id,
                request,
                currentUserId(authentication)
        );
    }

    @PatchMapping("/{id}/archive")
    public JobApplicationResponse updateArchived(
            @PathVariable Long id,
            @RequestBody boolean archived,
            Authentication authentication
    ) {
        return jobApplicationService.updateArchived(
                id,
                archived,
                currentUserId(authentication)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Long id,
            Authentication authentication
    ) {
        jobApplicationService.deleteApplication(
                id,
                currentUserId(authentication)
        );
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
