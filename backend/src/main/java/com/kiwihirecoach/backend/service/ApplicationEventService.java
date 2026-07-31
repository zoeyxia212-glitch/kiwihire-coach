package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.ApplicationEventResponse;
import com.kiwihirecoach.backend.dto.CreateApplicationEventRequest;
import com.kiwihirecoach.backend.dto.UpdateApplicationEventRequest;
import com.kiwihirecoach.backend.dto.UpdateFollowUpRequest;
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
                normalize(request.contactPerson()),
                normalize(request.notes()),
                normalize(request.nextAction()),
                request.followUpDueDate()
        );

        ApplicationEvent savedEvent =
                applicationEventRepository.save(event);
        synchronizeCurrentStatus(application);
        return toResponse(savedEvent);
    }

    public ApplicationEventResponse completeEvent(
            Long applicationId,
            Long eventId,
            Long userId
    ) {
        ApplicationEvent event = findOwnedEvent(
                applicationId,
                eventId,
                userId
        );

        event.setCompleted(true);
        return toResponse(applicationEventRepository.save(event));
    }

    public ApplicationEventResponse updateEvent(
            Long applicationId,
            Long eventId,
            UpdateApplicationEventRequest request,
            Long userId
    ) {
        ApplicationEvent event = findOwnedEvent(
                applicationId,
                eventId,
                userId
        );

        event.setStage(request.stage());
        event.setOccurredAt(
                request.occurredAt() != null
                        ? request.occurredAt()
                        : event.getOccurredAt()
        );
        event.setContactPerson(normalize(request.contactPerson()));
        event.setNotes(normalize(request.notes()));
        event.setNextAction(normalize(request.nextAction()));
        event.setFollowUpDueDate(request.followUpDueDate());

        ApplicationEvent savedEvent =
                applicationEventRepository.save(event);
        synchronizeCurrentStatus(savedEvent.getApplication());
        return toResponse(savedEvent);
    }

    public ApplicationEventResponse updateFollowUp(
            Long applicationId,
            Long eventId,
            UpdateFollowUpRequest request,
            Long userId
    ) {
        ApplicationEvent event = findOwnedEvent(
                applicationId,
                eventId,
                userId
        );

        if (request.completed() != null) {
            event.setCompleted(request.completed());
        }
        if (request.followUpDueDate() != null) {
            event.setFollowUpDueDate(request.followUpDueDate());
        }

        return toResponse(applicationEventRepository.save(event));
    }

    public void deleteEvent(
            Long applicationId,
            Long eventId,
            Long userId
    ) {
        ApplicationEvent event = findOwnedEvent(
                applicationId,
                eventId,
                userId
        );
        JobApplication application = event.getApplication();

        applicationEventRepository.delete(event);
        applicationEventRepository.flush();
        synchronizeCurrentStatus(application);
    }

    private ApplicationEvent findOwnedEvent(
            Long applicationId,
            Long eventId,
            Long userId
    ) {
        findOwnedApplication(applicationId, userId);

        ApplicationEvent event = applicationEventRepository
                .findByIdAndApplicationUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application update not found"
                ));

        if (!event.getApplication().getId().equals(applicationId)) {
            throw new ResourceNotFoundException(
                    "Application update not found"
            );
        }

        return event;
    }

    private void synchronizeCurrentStatus(JobApplication application) {
        String currentStatus = applicationEventRepository
                .findTopByApplicationIdOrderByOccurredAtDesc(
                        application.getId()
                )
                .map(ApplicationEvent::getStage)
                .orElse("Saved");

        application.setStatus(currentStatus);
        jobApplicationRepository.save(application);
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
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
