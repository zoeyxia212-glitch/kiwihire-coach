package com.kiwihirecoach.backend.integration;

import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class JobApplicationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(
                new User(
                        "integration.test@example.com",
                        "test-password-hash",
                        LocalDateTime.of(2026, 7, 26, 10, 0)
                )
        );
    }

    @Test
    void createApplicationPersistsAndReturnsApplication() throws Exception {
        String requestJson = """
                {
                  "userId": %d,
                  "company": "Xero",
                  "roleTitle": "Junior Software Developer",
                  "location": "Auckland",
                  "status": "Saved",
                  "jobDescription": "Java and React role",
                  "closingDate": "2026-08-01"
                }
                """.formatted(testUser.getId());

        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Xero"))
                .andExpect(jsonPath("$.userId")
                        .value(testUser.getId()));

        List<JobApplication> savedApplications =
                jobApplicationRepository.findByUserId(testUser.getId());

        assertEquals(1, savedApplications.size());
        assertEquals("Xero", savedApplications.get(0).getCompany());
        assertEquals("Saved", savedApplications.get(0).getStatus());
    }

    @Test
    void getApplicationReturnsApplicationFromDatabase() throws Exception {
        JobApplication application = jobApplicationRepository.save(
                new JobApplication(
                        "Datacom",
                        "Graduate Developer",
                        "Auckland",
                        "Applied",
                        "Spring Boot role",
                        LocalDate.of(2026, 8, 15),
                        testUser
                )
        );

        mockMvc.perform(get("/api/applications/{id}", application.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(application.getId()))
                .andExpect(jsonPath("$.company").value("Datacom"))
                .andExpect(jsonPath("$.status").value("Applied"))
                .andExpect(jsonPath("$.userId").value(testUser.getId()));
    }

    @Test
    void updateApplicationUpdatesDatabase() throws Exception {
        JobApplication application = jobApplicationRepository.save(
                new JobApplication(
                        "Xero",
                        "Junior Developer",
                        "Auckland",
                        "Saved",
                        "Original description",
                        LocalDate.of(2026, 8, 15),
                        testUser
                )
        );

        String requestJson = """
                {
                  "company": "Xero",
                  "roleTitle": "Software Developer",
                  "location": "Wellington",
                  "status": "Interview",
                  "jobDescription": "Updated description",
                  "closingDate": "2026-08-20"
                }
                """;

        mockMvc.perform(put("/api/applications/{id}", application.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleTitle").value("Software Developer"))
                .andExpect(jsonPath("$.status").value("Interview"));

        JobApplication updatedApplication =
                jobApplicationRepository.findById(application.getId()).orElseThrow();

        assertEquals("Software Developer", updatedApplication.getRoleTitle());
        assertEquals("Wellington", updatedApplication.getLocation());
        assertEquals("Interview", updatedApplication.getStatus());
    }

    @Test
    void deleteApplicationRemovesApplicationFromDatabase() throws Exception {
        JobApplication application = jobApplicationRepository.save(
                new JobApplication(
                        "Datacom",
                        "Systems Engineer",
                        "Auckland",
                        "Saved",
                        "Infrastructure role",
                        LocalDate.of(2026, 8, 30),
                        testUser
                )
        );

        mockMvc.perform(delete("/api/applications/{id}", application.getId()))
                .andExpect(status().isOk());

        boolean applicationStillExists =
                jobApplicationRepository.existsById(application.getId());

        assertFalse(applicationStillExists);
    }

    @Test
    void getApplicationsForUserReturnsApplicationsFromDatabase() throws Exception {
        jobApplicationRepository.save(
                new JobApplication(
                        "Xero",
                        "Software Developer",
                        "Auckland",
                        "Applied",
                        "Java role",
                        LocalDate.of(2026, 8, 15),
                        testUser
                )
        );

        jobApplicationRepository.save(
                new JobApplication(
                        "Datacom",
                        "Systems Engineer",
                        "Wellington",
                        "Interview",
                        "Infrastructure role",
                        LocalDate.of(2026, 8, 30),
                        testUser
                )
        );

        mockMvc.perform(get(
                        "/api/applications/user/{userId}",
                        testUser.getId()
                ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].userId").value(testUser.getId()))
                .andExpect(jsonPath("$[1].userId").value(testUser.getId()));
    }

    @Test
    void getMissingApplicationReturnsNotFound() throws Exception {
        long missingApplicationId = 999999L;

        mockMvc.perform(get(
                        "/api/applications/{id}",
                        missingApplicationId
                ))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Application not found"));
    }
}
