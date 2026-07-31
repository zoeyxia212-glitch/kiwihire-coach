package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.UserResponse;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.CandidateProfileRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.LearningGoalRepository;
import com.kiwihirecoach.backend.repository.ProductFeedbackRepository;
import com.kiwihirecoach.backend.repository.ResumeRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventRepository applicationEventRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final LearningGoalRepository learningGoalRepository;
    private final ProductFeedbackRepository productFeedbackRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeReviewRepository resumeReviewRepository;

    public AccountService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventRepository applicationEventRepository,
            CandidateProfileRepository candidateProfileRepository,
            JobApplicationRepository jobApplicationRepository,
            LearningGoalRepository learningGoalRepository,
            ProductFeedbackRepository productFeedbackRepository,
            ResumeRepository resumeRepository,
            ResumeReviewRepository resumeReviewRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.applicationEventRepository = applicationEventRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.learningGoalRepository = learningGoalRepository;
        this.productFeedbackRepository = productFeedbackRepository;
        this.resumeRepository = resumeRepository;
        this.resumeReviewRepository = resumeReviewRepository;
    }

    public UserResponse getAccount(Long userId) {
        User user = findUser(userId);
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    public void changePassword(
            Long userId,
            String currentPassword,
            String newPassword
    ) {
        User user = findUser(userId);
        verifyPassword(user, currentPassword);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(
            Long userId,
            String currentPassword,
            String confirmation
    ) {
        User user = findUser(userId);
        verifyPassword(user, currentPassword);

        if (!"DELETE".equals(confirmation)) {
            throw new IllegalArgumentException(
                    "Type DELETE to confirm account deletion."
            );
        }

        resumeReviewRepository.deleteByUserId(userId);
        learningGoalRepository.deleteByUserId(userId);
        productFeedbackRepository.deleteByUserId(userId);
        candidateProfileRepository.deleteByUserId(userId);
        applicationEventRepository.deleteByApplicationUserId(userId);
        jobApplicationRepository.deleteByUserId(userId);
        resumeRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Account not found."
                ));
    }

    private void verifyPassword(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }
    }
}
