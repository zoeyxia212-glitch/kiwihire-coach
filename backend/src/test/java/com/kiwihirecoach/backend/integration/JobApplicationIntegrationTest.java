package com.kiwihirecoach.backend.integration;

import com.kiwihirecoach.backend.entity.ApplicationEvent;
import com.kiwihirecoach.backend.entity.EvidenceItem;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.entity.Resume;
import com.kiwihirecoach.backend.entity.ResumeReview;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.EvidenceItemRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.ResumeRepository;
import com.kiwihirecoach.backend.repository.ResumeReviewRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.service.JwtService;
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
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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

    @Autowired
    private EvidenceItemRepository evidenceItemRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ResumeReviewRepository resumeReviewRepository;

    @Autowired
    private ApplicationEventRepository applicationEventRepository;

    @Autowired
    private JwtService jwtService;

    private User testUser;

    private String authHeader;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(
                new User(
                        "integration.test@example.com",
                        "test-password-hash",
                        LocalDateTime.of(2026, 7, 26, 10, 0)
                )
        );
        authHeader = "Bearer " + jwtService.generateToken(testUser);
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
                        .header("Authorization", authHeader)

                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
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

        mockMvc.perform(get("/api/applications/{id}", application.getId())
                .header("Authorization", authHeader))
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
                  "status": "First Interview",
                  "jobDescription": "Updated description",
                  "closingDate": "2026-08-20"
                }
                """;

        mockMvc.perform(put("/api/applications/{id}", application.getId())
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleTitle").value("Software Developer"))
                .andExpect(jsonPath("$.status").value("First Interview"));

        JobApplication updatedApplication =
                jobApplicationRepository.findById(application.getId()).orElseThrow();

        assertEquals("Software Developer", updatedApplication.getRoleTitle());
        assertEquals("Wellington", updatedApplication.getLocation());
        assertEquals("First Interview", updatedApplication.getStatus());
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

        mockMvc.perform(delete("/api/applications/{id}", application.getId())
                .header("Authorization", authHeader))
        .andExpect(status().isNoContent());

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
                        "First Interview",
                        "Infrastructure role",
                        LocalDate.of(2026, 8, 30),
                        testUser
                )
        );
mockMvc.perform(get("/api/applications")
                .header("Authorization", authHeader))
        .andExpect(status().isOk())

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
        ).header("Authorization", authHeader))
        .andExpect(status().isNotFound())
                .andExpect(content().string("Application not found"));
    }

    @Test
    void applicationPackSavesDecisionAndOwnedEvidence() throws Exception {
        JobApplication application = jobApplicationRepository.save(
                new JobApplication(
                        "Xero", "Graduate Developer", "Auckland", "Saved",
                        "Java and React role", LocalDate.of(2026, 10, 1), testUser
                )
        );
        EvidenceItem evidence = evidenceItemRepository.save(
                new EvidenceItem(
                        testUser,
                        "KiwiHire API",
                        "Built a job coaching platform",
                        "Designed secured REST endpoints",
                        "Delivered tested CRUD workflows",
                        "Java, Spring Boot"
                )
        );

        mockMvc.perform(patch("/api/applications/{id}/decision", application.getId())
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "decision": "Pursue",
                                  "decisionReason": "Strong graduate fit",
                                  "strongestFit": "Java API experience",
                                  "mainConcern": "Commercial experience"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.decision").value("Pursue"))
                .andExpect(jsonPath("$.strongestFit")
                        .value("Java API experience"));

        mockMvc.perform(patch("/api/applications/{id}/evidence", application.getId())
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"evidenceItemIds\":[%d]}".formatted(evidence.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.evidenceItemIds[0]").value(evidence.getId()));
    }

    @Test
    void submissionSnapshotFreezesApplicationPackAndCreatesTimelineEvent()
            throws Exception {
        JobApplication application = jobApplicationRepository.save(
                new JobApplication(
                        "Datacom", "Graduate Developer", "Auckland", "Saved",
                        "Java, Spring Boot and React", LocalDate.of(2026, 10, 15),
                        testUser
                )
        );
        Resume resume = resumeRepository.save(
                new Resume(
                        "Graduate CV",
                        "Software engineering roles",
                        "Java and React project experience",
                        testUser
                )
        );
        resumeReviewRepository.save(
                new ResumeReview(
                        testUser,
                        application,
                        resume,
                        78,
                        "[]",
                        "[]",
                        "[]",
                        "[]",
                        "[]"
                )
        );
        EvidenceItem evidence = evidenceItemRepository.save(
                new EvidenceItem(
                        testUser,
                        "KiwiHire API",
                        "Candidates needed one place to manage applications",
                        "Designed secured REST endpoints",
                        "Delivered tested CRUD workflows",
                        "Java, Spring Boot"
                )
        );
        application.replaceEvidenceItems(Set.of(evidence));
        jobApplicationRepository.save(application);

        mockMvc.perform(post(
                        "/api/applications/{id}/submission-snapshot",
                        application.getId()
                ).header("Authorization", authHeader))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("Applied"))
                .andExpect(jsonPath("$.submittedResumeName").value("Graduate CV"))
                .andExpect(jsonPath("$.submittedJobDescription")
                        .value("Java, Spring Boot and React"))
                .andExpect(jsonPath("$.submittedEvidence")
                        .value(org.hamcrest.Matchers.containsString("KiwiHire API")));

        JobApplication submitted = jobApplicationRepository
                .findById(application.getId())
                .orElseThrow();
        assertNotNull(submitted.getSubmittedAt());
        assertTrue(submitted.getSubmittedEvidence()
                .contains("Designed secured REST endpoints"));

        List<ApplicationEvent> timeline = applicationEventRepository
                .findByApplicationIdOrderByOccurredAtDesc(application.getId());
        assertEquals(1, timeline.size());
        assertEquals("Applied", timeline.get(0).getStage());
        assertEquals(submitted.getSubmittedAt(), timeline.get(0).getOccurredAt());
    }
}
