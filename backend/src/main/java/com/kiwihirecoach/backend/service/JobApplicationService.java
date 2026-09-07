package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.CreateJobApplicationRequest;
import com.kiwihirecoach.backend.dto.JobApplicationResponse;
import com.kiwihirecoach.backend.dto.UpdateJobApplicationRequest;
import com.kiwihirecoach.backend.dto.UpdateApplicationDecisionRequest;
import com.kiwihirecoach.backend.dto.UpdateApplicationEvidenceRequest;
import com.kiwihirecoach.backend.dto.UpdateApplicationAnswersRequest;
import com.kiwihirecoach.backend.entity.ApplicationAnswer;
import com.kiwihirecoach.backend.entity.ApplicationEvent;
import com.kiwihirecoach.backend.entity.EvidenceItem;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.repository.EvidenceItemRepository;
import com.kiwihirecoach.backend.repository.ApplicationAnswerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.LinkedHashSet;

@Service
public class JobApplicationService {
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final ApplicationEventRepository applicationEventRepository;
    private final ResumeReviewRepository resumeReviewRepository;
    private final EvidenceItemRepository evidenceItemRepository;
    private final ApplicationAnswerRepository applicationAnswerRepository;

    public JobApplicationService(
            JobApplicationRepository jobApplicationRepository,
            UserRepository userRepository,
            ApplicationEventRepository applicationEventRepository,
            ResumeReviewRepository resumeReviewRepository,
            EvidenceItemRepository evidenceItemRepository,
            ApplicationAnswerRepository applicationAnswerRepository
    ) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
        this.applicationEventRepository = applicationEventRepository;
        this.resumeReviewRepository = resumeReviewRepository;
        this.evidenceItemRepository = evidenceItemRepository;
        this.applicationAnswerRepository = applicationAnswerRepository;
    }

    public List<JobApplicationResponse> getApplicationsForUser(Long userId) {
        return jobApplicationRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public JobApplicationResponse getApplicationById(
            Long id,
            Long userId
    ) {
        JobApplication application = jobApplicationRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        return toResponse(application);
    }

    public JobApplicationResponse createApplication(
            CreateJobApplicationRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        JobApplication application = new JobApplication(
                request.getCompany(),
                request.getRoleTitle(),
                request.getLocation(),
                request.getStatus(),
                request.getJobDescription(),
                request.getClosingDate(),
                normalize(request.getSource()),
                normalize(request.getWorkMode()),
                normalize(request.getWorkRightsRequirement()),
                normalize(request.getSalaryRange()),
                normalize(request.getContactPerson()),
                normalize(request.getJobUrl()),
                normalize(request.getCareerLevel()),
                normalize(request.getEmploymentType()),
                request.getGraduateFriendly(),
                request.getSponsorshipAvailable(),
                normalize(request.getIndustry()),
                user
        );
        JobApplication savedApplication = jobApplicationRepository.save(application);

        return toResponse(savedApplication);
    }

    public JobApplicationResponse updateApplication(
            Long id,
            UpdateJobApplicationRequest request,
            Long userId
    ) {
        JobApplication application = jobApplicationRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setCompany(request.getCompany());
        application.setRoleTitle(request.getRoleTitle());
        application.setLocation(request.getLocation());
        application.setStatus(request.getStatus());
        application.setJobDescription(request.getJobDescription());
        application.setClosingDate(request.getClosingDate());
        application.setSource(normalize(request.getSource()));
        application.setWorkMode(normalize(request.getWorkMode()));
        application.setWorkRightsRequirement(
                normalize(request.getWorkRightsRequirement())
        );
        application.setSalaryRange(normalize(request.getSalaryRange()));
        application.setContactPerson(
                normalize(request.getContactPerson())
        );
        application.setJobUrl(normalize(request.getJobUrl()));
        application.setCareerLevel(normalize(request.getCareerLevel()));
        application.setEmploymentType(
                normalize(request.getEmploymentType())
        );
        application.setGraduateFriendly(request.getGraduateFriendly());
        application.setSponsorshipAvailable(
                request.getSponsorshipAvailable()
        );
        application.setIndustry(normalize(request.getIndustry()));

        JobApplication savedApplication = jobApplicationRepository.save(application);

        return toResponse(savedApplication);
    }

    public JobApplicationResponse updateArchived(
            Long id,
            boolean archived,
            Long userId
    ) {
        JobApplication application = jobApplicationRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found"
                ));
        application.setArchived(archived);
        return toResponse(jobApplicationRepository.save(application));
    }

    public JobApplicationResponse updateDecision(
            Long id,
            UpdateApplicationDecisionRequest request,
            Long userId
    ) {
        JobApplication application = findOwnedApplication(id, userId);
        application.updateDecision(
                normalize(request.decision()),
                normalize(request.decisionReason()),
                normalize(request.strongestFit()),
                normalize(request.mainConcern())
        );
        return toResponse(jobApplicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse updateEvidence(
            Long id,
            UpdateApplicationEvidenceRequest request,
            Long userId
    ) {
        JobApplication application = findOwnedApplication(id, userId);
        LinkedHashSet<EvidenceItem> selectedItems = new LinkedHashSet<>();
        request.evidenceItemIds().stream().distinct().forEach(itemId ->
                selectedItems.add(evidenceItemRepository
                        .findByIdAndUserId(itemId, userId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Evidence item not found"
                        )))
        );
        application.replaceEvidenceItems(selectedItems);
        return toResponse(jobApplicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse updateAnswers(
            Long id,
            UpdateApplicationAnswersRequest request,
            Long userId
    ) {
        JobApplication application = findOwnedApplication(id, userId);
        LinkedHashSet<ApplicationAnswer> selectedAnswers = new LinkedHashSet<>();
        request.applicationAnswerIds().stream().distinct().forEach(answerId ->
                selectedAnswers.add(applicationAnswerRepository
                        .findByIdAndUserId(answerId, userId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Application answer not found"
                        )))
        );
        application.replaceApplicationAnswers(selectedAnswers);
        return toResponse(jobApplicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse createSubmissionSnapshot(Long id, Long userId) {
        JobApplication application = findOwnedApplication(id, userId);
        var latestReview = resumeReviewRepository
                .findFirstByApplicationIdAndUserIdOrderByCreatedAtDesc(id, userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Save a role-specific CV review before marking this application as submitted."
                ));
        String submittedAnswers = application.getApplicationAnswers().stream()
                .map(answer -> answer.getQuestion() + "\n" + answer.getAnswer())
                .collect(java.util.stream.Collectors.joining("\n\n---\n\n"));
        String submittedEvidence = application.getEvidenceItems().stream()
                .map(evidence -> String.join("\n",
                        evidence.getTitle(),
                        "Situation and task: " + evidence.getContext(),
                        "Action: " + evidence.getAction(),
                        "Result: " + evidence.getResult(),
                        "Skills: " + evidence.getSkills()
                ))
                .collect(java.util.stream.Collectors.joining("\n\n---\n\n"));
        application.createSubmissionSnapshot(
                latestReview.getResume().getName(),
                latestReview.getResume().getContent(),
                submittedAnswers,
                submittedEvidence
        );
        JobApplication savedApplication =
                jobApplicationRepository.save(application);
        applicationEventRepository.save(new ApplicationEvent(
                savedApplication,
                "Applied",
                savedApplication.getSubmittedAt(),
                savedApplication.getContactPerson(),
                "Submission snapshot created with the selected CV, answers, and evidence.",
                null,
                null
        ));
        return toResponse(savedApplication);
    }

    public JobApplicationResponse restoreSubmissionSnapshot(
            Long id,
            LocalDateTime submittedAt,
            String resumeName,
            String jobDescription,
            String resumeContent,
            String answers,
            String evidence,
            Long userId
    ) {
        if (submittedAt == null) {
            throw new IllegalArgumentException("Submission time is required");
        }
        JobApplication application = findOwnedApplication(id, userId);
        application.restoreSubmissionSnapshot(
                submittedAt,
                normalize(resumeName),
                normalize(jobDescription),
                normalize(resumeContent),
                normalize(answers),
                normalize(evidence)
        );
        return toResponse(jobApplicationRepository.save(application));
    }

    @Transactional
    public void deleteApplication(Long id, Long userId) {
        JobApplication application = jobApplicationRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        resumeReviewRepository.deleteByApplicationId(id);
        applicationEventRepository.deleteByApplicationId(id);
        jobApplicationRepository.delete(application);
    }

    private JobApplicationResponse toResponse(JobApplication application) {
        JobApplicationResponse response = new JobApplicationResponse(
                application.getId(),
                application.getCompany(),
                application.getRoleTitle(),
                application.getLocation(),
                application.getStatus(),
                application.getJobDescription(),
                application.getClosingDate(),
                application.getCreatedAt(),
                application.getUser().getId(),
                application.getUser().getEmail(),
                application.getSource(),
                application.getWorkMode(),
                application.getWorkRightsRequirement(),
                application.getSalaryRange(),
                application.getContactPerson(),
                application.getJobUrl(),
                application.getCareerLevel(),
                application.getEmploymentType(),
                application.getGraduateFriendly(),
                application.getSponsorshipAvailable(),
                application.getIndustry(),
                application.isArchived()
        );
        response.addApplicationPack(
                application.getDecision(),
                application.getDecisionReason(),
                application.getStrongestFit(),
                application.getMainConcern(),
                application.getEvidenceItems().stream()
                        .map(EvidenceItem::getId)
                        .toList()
        );
        response.addApplicationAnswerIds(
                application.getApplicationAnswers().stream()
                        .map(ApplicationAnswer::getId)
                        .toList()
        );
        response.addSubmissionSnapshot(
                application.getSubmittedAt(),
                application.getSubmittedResumeName(),
                application.getSubmittedJobDescription(),
                application.getSubmittedResumeContent(),
                application.getSubmittedAnswers(),
                application.getSubmittedEvidence()
        );
        return response;
    }

    private JobApplication findOwnedApplication(Long id, Long userId) {
        return jobApplicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found"
                ));
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
