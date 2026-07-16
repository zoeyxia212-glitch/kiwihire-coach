package com.kiwihirecoach.backend.controller;

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
import com.kiwihirecoach.backend.dto.UpdateJobApplicationRequest;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class JobApplicationController {
    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @GetMapping("/user/{userId}")
    public List<JobApplicationResponse> getApplicationsForUser(@PathVariable Long userId) {
        return jobApplicationService.getApplicationsForUser(userId);
    }
    @GetMapping("/{id}")
public JobApplicationResponse getApplicationById(@PathVariable Long id) {
    return jobApplicationService.getApplicationById(id);
}
    @PostMapping
public JobApplicationResponse createApplication(@RequestBody CreateJobApplicationRequest request) {
    return jobApplicationService.createApplication(request);
}
@PutMapping("/{id}")
public JobApplicationResponse updateApplication(
        @PathVariable Long id,
        @RequestBody UpdateJobApplicationRequest request
) {
    return jobApplicationService.updateApplication(id, request);
}
@DeleteMapping("/{id}")
public void deleteApplication(@PathVariable Long id) {
    jobApplicationService.deleteApplication(id);
}
}