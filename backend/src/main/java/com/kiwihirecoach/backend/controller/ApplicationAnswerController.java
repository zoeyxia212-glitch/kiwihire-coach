package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.ApplicationAnswerResponse;
import com.kiwihirecoach.backend.dto.SaveApplicationAnswerRequest;
import com.kiwihirecoach.backend.service.ApplicationAnswerService;
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
@RequestMapping("/api/application-answers")
public class ApplicationAnswerController {
    private final ApplicationAnswerService applicationAnswerService;

    public ApplicationAnswerController(ApplicationAnswerService applicationAnswerService) {
        this.applicationAnswerService = applicationAnswerService;
    }

    @GetMapping
    public List<ApplicationAnswerResponse> getAnswers(Authentication authentication) {
        return applicationAnswerService.getAnswers(currentUserId(authentication));
    }

    @PostMapping
    public ResponseEntity<ApplicationAnswerResponse> createAnswer(
            @Valid @RequestBody SaveApplicationAnswerRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                applicationAnswerService.createAnswer(
                        request,
                        currentUserId(authentication)
                )
        );
    }

    @PutMapping("/{answerId}")
    public ApplicationAnswerResponse updateAnswer(
            @PathVariable Long answerId,
            @Valid @RequestBody SaveApplicationAnswerRequest request,
            Authentication authentication
    ) {
        return applicationAnswerService.updateAnswer(
                answerId,
                request,
                currentUserId(authentication)
        );
    }

    @DeleteMapping("/{answerId}")
    public ResponseEntity<Void> deleteAnswer(
            @PathVariable Long answerId,
            Authentication authentication
    ) {
        applicationAnswerService.deleteAnswer(answerId, currentUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
