package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.dto.CreateJobApplicationRequest;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import com.kiwihirecoach.backend.dto.JobApplicationResponse;
import java.util.List;
import com.kiwihirecoach.backend.dto.UpdateJobApplicationRequest;

@Service
public class JobApplicationService {
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private JobApplicationResponse toResponse(JobApplication application) {
    return new JobApplicationResponse(
            application.getId(),
            application.getCompany(),
            application.getRoleTitle(),
            application.getLocation(),
            application.getStatus(),
            application.getJobDescription(),
            application.getClosingDate(),
            application.getCreatedAt(),
            application.getUser().getId(),
            application.getUser().getEmail()
    );
}

    public JobApplicationService(JobApplicationRepository jobApplicationRepository,    UserRepository userRepository
) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
    }

    public List<JobApplicationResponse> getApplicationsForUser(Long userId) {
    return jobApplicationRepository.findByUserId(userId)
            .stream()
            .map(this::toResponse)
            .toList();
}
  public JobApplicationResponse getApplicationById(Long id) {
    JobApplication application = jobApplicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

    return toResponse(application);
}
    public JobApplicationResponse createApplication(CreateJobApplicationRequest request) {
    User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    JobApplication application = new JobApplication(
            request.getCompany(),
            request.getRoleTitle(),
            request.getLocation(),
            request.getStatus(),
            request.getJobDescription(),
            request.getClosingDate(),
            user
    );
    JobApplication savedApplication = jobApplicationRepository.save(application);

    return toResponse(savedApplication);
}
public JobApplicationResponse updateApplication(Long id, UpdateJobApplicationRequest request) {
    JobApplication application = jobApplicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

    application.setCompany(request.getCompany());
    application.setRoleTitle(request.getRoleTitle());
    application.setLocation(request.getLocation());
    application.setStatus(request.getStatus());
    application.setJobDescription(request.getJobDescription());

    JobApplication savedApplication = jobApplicationRepository.save(application);

    return toResponse(savedApplication);
}
public void deleteApplication(Long id) {
    JobApplication application = jobApplicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

    jobApplicationRepository.delete(application);
}
}
