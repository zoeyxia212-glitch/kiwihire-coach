package com.kiwihirecoach.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwihirecoach.backend.dto.RestoreAccountBackupResponse;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.ResumeRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.service.AccountBackupRestoreService;
import com.kiwihirecoach.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AccountBackupRestoreIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AccountBackupRestoreService restoreService;

    private User user;
    private String authHeader;

    @BeforeEach
    void setUp() {
        user = userRepository.save(new User(
                "restore.test@example.com",
                "test-password-hash",
                LocalDateTime.now()
        ));
        authHeader = "Bearer " + jwtService.generateToken(user);
    }

    @Test
    void restoreCreatesBackupDataThroughOneEndpoint() throws Exception {
        mockMvc.perform(post("/api/account/restore")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"data\":" + validBackupData() + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applications").value(1))
                .andExpect(jsonPath("$.resumes").value(1))
                .andExpect(jsonPath("$.reviews").value(1))
                .andExpect(jsonPath("$.timelineEvents").value(2))
                .andExpect(jsonPath("$.restoredSubmissionSnapshots").value(1))
                .andExpect(jsonPath("$.skippedSubmissionSnapshots").value(0));

        mockMvc.perform(get("/api/applications/11")
                        .header("Authorization", authHeader))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/applications")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("Applied"))
                .andExpect(jsonPath("$[0].submittedAt").value("2026-09-02T09:05:00"))
                .andExpect(jsonPath("$[0].submittedResumeName").value("Java CV"))
                .andExpect(jsonPath("$[0].submittedResumeContent")
                        .value("Original submitted CV"));

        mockMvc.perform(get("/api/reviews")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].helpful").value(true))
                .andExpect(jsonPath("$[0].workflowIntent").value("Yes"));

        assertEquals(1, applicationRepository.findByUserId(user.getId()).size());
        assertEquals(1, resumeRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).size());
    }

    @Test
    void invalidLaterItemRollsBackEarlierWrites() throws Exception {
        var invalidData = objectMapper.readTree(validBackupData());
        ((com.fasterxml.jackson.databind.node.ObjectNode)
                invalidData.withArray("resumes").get(0)).put("name", "");

        assertThrows(IllegalArgumentException.class, () ->
                restoreService.restore(invalidData, user.getId())
        );

        assertEquals(0, applicationRepository.findByUserId(user.getId()).size());
        assertEquals(0, resumeRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).size());
    }

    private String validBackupData() {
        return """
                {
                  "profile": {
                    "targetRoles": "Junior Software Engineer",
                    "workRights": "NZ post-study work visa",
                    "preferredLocations": "Auckland",
                    "careerStage": "Graduate",
                    "technicalSkills": "Java, React",
                    "experienceSummary": "Built KiwiHire Coach",
                    "starExamples": ""
                  },
                  "applications": [{
                    "id": 11,
                    "company": "Kiwi Tech",
                    "roleTitle": "Junior Developer",
                    "location": "Auckland",
                    "status": "Saved",
                    "jobDescription": "Build and maintain web applications.",
                    "closingDate": "2026-10-01",
                    "submittedAt": "2026-09-02T09:05:00",
                    "submittedResumeName": "Java CV",
                    "submittedJobDescription": "Original submitted JD",
                    "submittedResumeContent": "Original submitted CV",
                    "submittedAnswers": "Original answers",
                    "submittedEvidence": "Original evidence",
                    "evidenceItemIds": [],
                    "applicationAnswerIds": []
                  }],
                  "timelines": [{
                    "applicationId": 11,
                    "events": [{
                      "stage": "Applied",
                      "occurredAt": "2026-09-02T09:00:00",
                      "notes": "Submitted online"
                    }, {
                      "stage": "Saved",
                      "occurredAt": "2026-09-01T09:00:00",
                      "notes": "Role saved"
                    }]
                  }],
                  "resumes": [{
                    "id": 21,
                    "name": "Java CV",
                    "purpose": "Junior Java roles",
                    "content": "Java and React project experience"
                  }],
                  "reviews": [{
                    "id": 31,
                    "applicationId": 11,
                    "resumeId": 21,
                    "score": 75,
                    "matched": [],
                    "transferable": [],
                    "missing": [],
                    "suggestions": [],
                    "questions": [],
                    "answers": [],
                    "answerStatuses": [],
                    "suggestionStatuses": [],
                    "mockInterviewSessions": [],
                    "helpful": true,
                    "feedbackComment": "Useful comparison",
                    "workflowIntent": "Yes"
                  }],
                  "evidence": [],
                  "applicationAnswers": [],
                  "learningGoals": [],
                  "feedback": []
                }
                """;
    }
}
