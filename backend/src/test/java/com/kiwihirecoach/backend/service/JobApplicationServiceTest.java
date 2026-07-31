package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.JobApplicationResponse;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {
private static final Long TEST_USER_ID = 1L;
    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private UserRepository userRepository;
@Mock
private ApplicationEventRepository applicationEventRepository;

@Mock
private ResumeReviewRepository resumeReviewRepository;
    @InjectMocks
    private JobApplicationService jobApplicationService;

    @Test
    void getApplicationByIdReturnsApplication() {
        User user = new User(
                "zoey.xia@example.com",
                "password-hash",
                LocalDateTime.now()
        );

JobApplication application = new JobApplication(
        "Xero",
        "Junior Software Developer",
        "Auckland",
        "Applied",
        "Java and React role",
        LocalDate.of(2026, 8, 1),
        user
);

        when(jobApplicationRepository.findByIdAndUserId(1L, TEST_USER_ID))
                .thenReturn(Optional.of(application));

        JobApplicationResponse response =
                jobApplicationService.getApplicationById(1L, TEST_USER_ID);

        assertEquals("Xero", response.getCompany());
    }

    @Test
    void getApplicationByIdThrowsWhenApplicationDoesNotExist() {
        when(jobApplicationRepository.findByIdAndUserId(99L,TEST_USER_ID))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> jobApplicationService.getApplicationById(99L,TEST_USER_ID)
        );

        assertEquals("Application not found", exception.getMessage());
    }

    @Test
    void deleteApplicationDeletesExistingApplication() {
        JobApplication application = new JobApplication();

        when(jobApplicationRepository.findByIdAndUserId(1L,TEST_USER_ID))
                .thenReturn(Optional.of(application));

        jobApplicationService.deleteApplication(1L, TEST_USER_ID);

        verify(jobApplicationRepository).delete(application);
    }

    @Test
    void deleteApplicationThrowsWhenApplicationDoesNotExist() {
        when(jobApplicationRepository.findByIdAndUserId(99L,TEST_USER_ID))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> jobApplicationService.deleteApplication(99L,  TEST_USER_ID)
        );

        assertEquals("Application not found", exception.getMessage());
    }
}
