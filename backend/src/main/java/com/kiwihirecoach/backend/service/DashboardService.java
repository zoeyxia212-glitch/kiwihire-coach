package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.DashboardApplicationResponse;
import com.kiwihirecoach.backend.dto.DashboardFollowUpResponse;
import com.kiwihirecoach.backend.dto.DashboardResponse;
import com.kiwihirecoach.backend.dto.DashboardReminderResponse;
import com.kiwihirecoach.backend.dto.DashboardInactiveApplicationResponse;
import com.kiwihirecoach.backend.dto.DashboardConversionResponse;
import com.kiwihirecoach.backend.entity.ApplicationEvent;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.function.Function;
import java.util.Map;

@Service
public class DashboardService {
    private static final Set<String> INTERVIEW_STAGES = Set.of(
            "Recruiter Screen",
            "First Interview",
            "Second Interview",
            "Technical Interview",
            "Reference Check"
    );

    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationEventRepository applicationEventRepository;

    public DashboardService(
            JobApplicationRepository jobApplicationRepository,
            ApplicationEventRepository applicationEventRepository
    ) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.applicationEventRepository = applicationEventRepository;
    }

    public DashboardResponse getDashboard(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekEnd = today.plusDays(7);
        List<JobApplication> applications =
                jobApplicationRepository.findByUserId(userId)
                        .stream()
                        .filter(application -> !application.isArchived())
                        .toList();
        List<ApplicationEvent> openFollowUps =
                applicationEventRepository
                        .findByApplicationUserIdAndCompletedFalseAndFollowUpDueDateIsNotNullOrderByFollowUpDueDateAsc(
                                userId
                        );
        List<ApplicationEvent> activeOpenFollowUps = openFollowUps
                .stream()
                .filter(event -> !event.getApplication().isArchived())
                .toList();
        List<ApplicationEvent> applicationHistory = applicationEventRepository
                .findByApplicationUserIdOrderByOccurredAtDesc(userId)
                .stream()
                .filter(event -> !event.getApplication().isArchived())
                .toList();

        List<ApplicationEvent> actionableFollowUps = activeOpenFollowUps
                .stream()
                .filter(event ->
                        !event.getFollowUpDueDate().isAfter(today)
                )
                .toList();

        long interviewApplications = applications
                .stream()
                .filter(application ->
                        INTERVIEW_STAGES.contains(application.getStatus())
                )
                .count();
        long dueToday = actionableFollowUps
                .stream()
                .filter(event ->
                        event.getFollowUpDueDate().isEqual(today)
                )
                .count();
        long overdue = actionableFollowUps.size() - dueToday;
        long submittedApplications = applications.stream()
                .filter(application ->
                        application.getSubmittedAt() != null
                                || !"Saved".equals(application.getStatus())
                )
                .count();
        Set<Long> interviewApplicationIds = applicationHistory.stream()
                .filter(event -> INTERVIEW_STAGES.contains(event.getStage()))
                .map(event -> event.getApplication().getId())
                .collect(Collectors.toSet());
        applications.stream()
                .filter(application ->
                        INTERVIEW_STAGES.contains(application.getStatus())
                                || "Offer".equals(application.getStatus())
                )
                .map(JobApplication::getId)
                .forEach(interviewApplicationIds::add);
        Set<Long> offerApplicationIds = applicationHistory.stream()
                .filter(event -> "Offer".equals(event.getStage()))
                .map(event -> event.getApplication().getId())
                .collect(Collectors.toSet());
        applications.stream()
                .filter(application -> "Offer".equals(application.getStatus()))
                .map(JobApplication::getId)
                .forEach(offerApplicationIds::add);
        List<DashboardReminderResponse> upcomingReminders =
                buildUpcomingReminders(
                        applications,
                        activeOpenFollowUps,
                        userId,
                        today,
                        weekEnd
                );

        return new DashboardResponse(
                applications.size(),
                interviewApplications,
                dueToday,
                overdue,
                actionableFollowUps
                        .stream()
                        .map(event -> toFollowUp(event, today))
                        .toList(),
                upcomingReminders,
                applications.stream()
                        .filter(application -> !Set.of(
                                "Offer",
                                "Rejected",
                                "Withdrawn"
                        ).contains(application.getStatus()))
                        .map(this::toInactiveApplication)
                        .sorted(Comparator.comparing(
                                DashboardInactiveApplicationResponse::lastActivityAt
                        ))
                        .toList(),
                applications
                        .stream()
                        .sorted(Comparator.comparing(
                                JobApplication::getCreatedAt
                        ).reversed())
                        .limit(5)
                        .map(this::toApplication)
                        .toList(),
                applications.size(),
                submittedApplications,
                interviewApplicationIds.size(),
                offerApplicationIds.size(),
                buildConversionGroups(
                        applications,
                        interviewApplicationIds,
                        JobApplication::getSource,
                        "Not recorded"
                ),
                buildConversionGroups(
                        applications,
                        interviewApplicationIds,
                        JobApplication::getCareerLevel,
                        "Not specified"
                )
        );
    }

    private List<DashboardConversionResponse> buildConversionGroups(
            List<JobApplication> applications,
            Set<Long> interviewApplicationIds,
            Function<JobApplication, String> labelSelector,
            String missingLabel
    ) {
        Map<String, List<JobApplication>> groups = applications.stream()
                .filter(application ->
                        application.getSubmittedAt() != null
                                || !"Saved".equals(application.getStatus())
                )
                .collect(Collectors.groupingBy(application -> {
                    String label = labelSelector.apply(application);
                    return label == null || label.isBlank()
                            ? missingLabel
                            : label.trim();
                }));

        return groups.entrySet().stream()
                .map(entry -> {
                    long submitted = entry.getValue().size();
                    long interviewed = entry.getValue().stream()
                            .filter(application ->
                                    interviewApplicationIds.contains(application.getId())
                            )
                            .count();
                    return new DashboardConversionResponse(
                            entry.getKey(),
                            submitted,
                            interviewed,
                            submitted == 0
                                    ? 0
                                    : (int) Math.round(interviewed * 100.0 / submitted)
                    );
                })
                .sorted(Comparator
                        .comparingLong(DashboardConversionResponse::submitted)
                        .reversed()
                        .thenComparing(DashboardConversionResponse::label))
                .toList();
    }

    private DashboardInactiveApplicationResponse toInactiveApplication(
            JobApplication application
    ) {
        LocalDateTime lastActivityAt = applicationEventRepository
                .findTopByApplicationIdOrderByOccurredAtDesc(
                        application.getId()
                )
                .map(ApplicationEvent::getOccurredAt)
                .orElse(application.getCreatedAt());

        return new DashboardInactiveApplicationResponse(
                application.getId(),
                application.getCompany(),
                application.getRoleTitle(),
                application.getStatus(),
                lastActivityAt
        );
    }

    private List<DashboardReminderResponse> buildUpcomingReminders(
            List<JobApplication> applications,
            List<ApplicationEvent> openFollowUps,
            Long userId,
            LocalDate today,
            LocalDate weekEnd
    ) {
        List<DashboardReminderResponse> reminders = new ArrayList<>();

        applications.stream()
                .filter(application -> application.getClosingDate() != null)
                .filter(application ->
                        application.getClosingDate().isAfter(today)
                                && !application
                                .getClosingDate()
                                .isAfter(weekEnd)
                )
                .map(application -> new DashboardReminderResponse(
                        "Closing date",
                        application.getId(),
                        application.getCompany(),
                        application.getRoleTitle(),
                        "Application closes",
                        application.getClosingDate().atStartOfDay()
                ))
                .forEach(reminders::add);

        openFollowUps.stream()
                .filter(event -> event.getFollowUpDueDate().isAfter(today))
                .filter(event ->
                        !event.getFollowUpDueDate().isAfter(weekEnd)
                )
                .map(event -> new DashboardReminderResponse(
                        "Follow-up",
                        event.getApplication().getId(),
                        event.getApplication().getCompany(),
                        event.getApplication().getRoleTitle(),
                        event.getNextAction() == null
                                || event.getNextAction().isBlank()
                                ? "Follow up"
                                : event.getNextAction(),
                        event.getFollowUpDueDate().atStartOfDay()
                ))
                .forEach(reminders::add);

        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = weekEnd.plusDays(1).atStartOfDay();
        applicationEventRepository
                .findByApplicationUserIdAndOccurredAtBetweenOrderByOccurredAtAsc(
                        userId,
                        start,
                        end
                )
                .stream()
                .filter(event -> INTERVIEW_STAGES.contains(event.getStage()))
                .map(event -> new DashboardReminderResponse(
                        "Interview",
                        event.getApplication().getId(),
                        event.getApplication().getCompany(),
                        event.getApplication().getRoleTitle(),
                        event.getStage(),
                        event.getOccurredAt()
                ))
                .forEach(reminders::add);

        return reminders.stream()
                .sorted(Comparator.comparing(
                        DashboardReminderResponse::dueAt
                ))
                .toList();
    }

    private DashboardFollowUpResponse toFollowUp(
            ApplicationEvent event,
            LocalDate today
    ) {
        JobApplication application = event.getApplication();

        return new DashboardFollowUpResponse(
                event.getId(),
                application.getId(),
                application.getCompany(),
                application.getRoleTitle(),
                event.getStage(),
                event.getNextAction(),
                event.getFollowUpDueDate(),
                event.getFollowUpDueDate().isBefore(today)
        );
    }

    private DashboardApplicationResponse toApplication(
            JobApplication application
    ) {
        return new DashboardApplicationResponse(
                application.getId(),
                application.getCompany(),
                application.getRoleTitle(),
                application.getStatus(),
                application.getCreatedAt()
        );
    }
}
