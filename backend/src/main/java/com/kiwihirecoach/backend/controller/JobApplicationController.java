package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.service.JobApplicationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.kiwihirecoach.backend.dto.CreateJobApplicationRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import com.kiwihirecoach.backend.dto.JobApplicationResponse;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @GetMapping("/user/{userId}")
    public List<JobApplication> getApplicationsForUser(@PathVariable Long userId) {
        return jobApplicationService.getApplicationsForUser(userId);
    }
    @GetMapping("/{id}")
public JobApplicationResponse getApplicationById(@PathVariable Long id) {
    return jobApplicationService.getApplicationById(id);
}
    @PostMapping
public JobApplication createApplication(@RequestBody CreateJobApplicationRequest request) {
    return jobApplicationService.createApplication(request);
}
}