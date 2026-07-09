package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {
    private final JobApplicationRepository jobApplicationRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public List<JobApplication> getApplicationsForUser(Long userId) {
        return jobApplicationRepository.findByUserId(userId);
    }
}