package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.ApplicationEventResponse;
import com.kiwihirecoach.backend.dto.CreateApplicationEventRequest;
import com.kiwihirecoach.backend.entity.ApplicationEvent;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationEventService {
    private final ApplicationEventRepository applicationEventRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public ApplicationEventService(
            ApplicationEventRepository applicationEventRepository,
            JobApplicationRepository jobApplicationRepository
    ) {
        this.applicationEventRepository = applicationEventRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public List<ApplicationEventResponse> getEvents(
            Long applicationId,
            Long userId
    ) {
        findOwnedApplication(applicationId, userId);

        return applicationEventRepository
                .findByApplicationIdOrderByOccurredAtDesc(applicationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ApplicationEventResponse createEvent(
            Long applicationId,
            CreateApplicationEventRequest request,
            Long userId
    ) {
        JobApplication application = findOwnedApplication(
                applicationId,
                userId
        );

        ApplicationEvent event = new ApplicationEvent(
                application,
                request.stage(),
                request.occurredAt() != null
                        ? request.occurredAt()
                        : LocalDateTime.now(),
                request.contactPerson(),
                request.notes(),
                request.nextAction(),
                request.followUpDueDate()
        );

        application.setStatus(request.stage());
        jobApplicationRepository.save(application);

        return toResponse(applicationEventRepository.save(event));
    }

    public ApplicationEventResponse completeEvent(
            Long eventId,
            Long userId
    ) {
        ApplicationEvent event = applicationEventRepository
                .findByIdAndApplicationUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application update not found"
                ));

        event.setCompleted(true);
        return toResponse(applicationEventRepository.save(event));
    }

    private JobApplication findOwnedApplication(
            Long applicationId,
            Long userId
    ) {
        return jobApplicationRepository
                .findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found"
                ));
    }

    private ApplicationEventResponse toResponse(
            ApplicationEvent event
    ) {
        return new ApplicationEventResponse(
                event.getId(),
                event.getApplication().getId(),
                event.getStage(),
                event.getOccurredAt(),
                event.getContactPerson(),
                event.getNotes(),
                event.getNextAction(),
                event.getFollowUpDueDate(),
                event.isCompleted(),
                event.getCreatedAt()
        );
    }
}
