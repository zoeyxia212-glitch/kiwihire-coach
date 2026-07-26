package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.DashboardApplicationResponse;
import com.kiwihirecoach.backend.dto.DashboardFollowUpResponse;
import com.kiwihirecoach.backend.dto.DashboardResponse;
import com.kiwihirecoach.backend.entity.ApplicationEvent;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

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
        List<JobApplication> applications =
                jobApplicationRepository.findByUserId(userId);
        List<ApplicationEvent> openFollowUps =
                applicationEventRepository
                        .findByApplicationUserIdAndCompletedFalseAndFollowUpDueDateIsNotNullOrderByFollowUpDueDateAsc(
                                userId
                        );

        List<ApplicationEvent> actionableFollowUps = openFollowUps
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

        return new DashboardResponse(
                applications.size(),
                interviewApplications,
                dueToday,
                overdue,
                actionableFollowUps
                        .stream()
                        .map(event -> toFollowUp(event, today))
                        .toList(),
                jobApplicationRepository
                        .findTop5ByUserIdOrderByCreatedAtDesc(userId)
                        .stream()
                        .map(this::toApplication)
                        .toList()
        );
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
