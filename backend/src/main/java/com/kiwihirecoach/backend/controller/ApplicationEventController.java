package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.ApplicationEventResponse;
import com.kiwihirecoach.backend.dto.CreateApplicationEventRequest;
import com.kiwihirecoach.backend.service.ApplicationEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/events")
public class ApplicationEventController {
    private final ApplicationEventService applicationEventService;

    public ApplicationEventController(
            ApplicationEventService applicationEventService
    ) {
        this.applicationEventService = applicationEventService;
    }

    @GetMapping
    public List<ApplicationEventResponse> getEvents(
            @PathVariable Long applicationId,
            Authentication authentication
    ) {
        return applicationEventService.getEvents(
                applicationId,
                currentUserId(authentication)
        );
    }

    @PostMapping
    public ResponseEntity<ApplicationEventResponse> createEvent(
            @PathVariable Long applicationId,
            @Valid @RequestBody CreateApplicationEventRequest request,
            Authentication authentication
    ) {
        ApplicationEventResponse response =
                applicationEventService.createEvent(
                        applicationId,
                        request,
                        currentUserId(authentication)
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PatchMapping("/{eventId}/complete")
    public ApplicationEventResponse completeEvent(
            @PathVariable Long eventId,
            Authentication authentication
    ) {
        return applicationEventService.completeEvent(
                eventId,
                currentUserId(authentication)
        );
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
