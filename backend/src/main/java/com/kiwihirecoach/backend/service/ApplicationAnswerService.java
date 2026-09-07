package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.ApplicationAnswerResponse;
import com.kiwihirecoach.backend.dto.SaveApplicationAnswerRequest;
import com.kiwihirecoach.backend.entity.ApplicationAnswer;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.ApplicationAnswerRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.entity.JobApplication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationAnswerService {
    private final ApplicationAnswerRepository applicationAnswerRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public ApplicationAnswerService(
            ApplicationAnswerRepository applicationAnswerRepository,
            UserRepository userRepository,
            JobApplicationRepository jobApplicationRepository
    ) {
        this.applicationAnswerRepository = applicationAnswerRepository;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public List<ApplicationAnswerResponse> getAnswers(Long userId) {
        return applicationAnswerRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ApplicationAnswerResponse createAnswer(
            SaveApplicationAnswerRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ApplicationAnswer answer = new ApplicationAnswer(
                user,
                clean(request.question()),
                clean(request.answer()),
                cleanOptional(request.tags()),
                cleanOptional(request.roleTypes())
        );
        return toResponse(applicationAnswerRepository.save(answer));
    }

    public ApplicationAnswerResponse updateAnswer(
            Long answerId,
            SaveApplicationAnswerRequest request,
            Long userId
    ) {
        ApplicationAnswer answer = findOwnedAnswer(answerId, userId);
        answer.update(
                clean(request.question()),
                clean(request.answer()),
                cleanOptional(request.tags()),
                cleanOptional(request.roleTypes())
        );
        return toResponse(applicationAnswerRepository.save(answer));
    }

    @Transactional
    public void deleteAnswer(Long answerId, Long userId) {
        ApplicationAnswer answer = findOwnedAnswer(answerId, userId);
        List<JobApplication> applications =
                jobApplicationRepository.findByApplicationAnswersId(answerId);
        applications.forEach(application -> {
            application.getApplicationAnswers().remove(answer);
            jobApplicationRepository.save(application);
        });
        applicationAnswerRepository.delete(answer);
    }

    private ApplicationAnswer findOwnedAnswer(Long answerId, Long userId) {
        return applicationAnswerRepository.findByIdAndUserId(answerId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application answer not found"
                ));
    }

    private String clean(String value) {
        return value.trim();
    }

    private String cleanOptional(String value) {
        return value == null ? "" : value.trim();
    }

    private ApplicationAnswerResponse toResponse(ApplicationAnswer answer) {
        return new ApplicationAnswerResponse(
                answer.getId(),
                answer.getQuestion(),
                answer.getAnswer(),
                answer.getTags(),
                answer.getRoleTypes(),
                answer.getCreatedAt(),
                answer.getUpdatedAt()
        );
    }
}
