package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.dto.CreateJobApplicationRequest;
import com.kiwihirecoach.backend.entity.User;
import org.springframework.stereotype.Service;
import com.kiwihirecoach.backend.dto.JobApplicationResponse;
import java.util.List;

@Service
public class JobApplicationService {
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private JobApplicationResponse toResponse(JobApplication application) {
    return new JobApplicationResponse(
            application.getId(),
            application.getCompany(),
            application.getRoleTitle(),
            application.getStatus(),
            application.getJobDescription(),
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

    public List<JobApplication> getApplicationsForUser(Long userId) {
        return jobApplicationRepository.findByUserId(userId);
    }
  public JobApplicationResponse getApplicationById(Long id) {
    JobApplication application = jobApplicationRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Application not found"));

    return toResponse(application);
}
    public JobApplication createApplication(CreateJobApplicationRequest request) {
    User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

    JobApplication application = new JobApplication(
            request.getCompany(),
            request.getRoleTitle(),
            request.getStatus(),
            request.getJobDescription(),
            user
    );

    return jobApplicationRepository.save(application);
}

}
