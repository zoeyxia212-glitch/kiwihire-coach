package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.CreateJobApplicationRequest;
import com.kiwihirecoach.backend.dto.JobApplicationResponse;
import com.kiwihirecoach.backend.dto.UpdateJobApplicationRequest;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.service.JobApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobApplicationController.class)
class JobApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobApplicationService jobApplicationService;

    private JobApplicationResponse defaultResponse;

    @BeforeEach
    void setUp() {
        defaultResponse = new JobApplicationResponse(
                1L,
                "Xero",
                "Junior Software Developer",
                "Auckland",
                "Applied",
                "Java and React role",
                LocalDate.of(2026, 8, 1),
                LocalDateTime.of(2026, 7, 24, 10, 0),
                1L,
                "zoey.xia@example.com"
        );
    }

    @Test
    void getApplicationByIdReturnsApplication() throws Exception {
        when(jobApplicationService.getApplicationById(1L))
                .thenReturn(defaultResponse);

        mockMvc.perform(get("/api/applications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Xero"))
                .andExpect(jsonPath("$.roleTitle")
                        .value("Junior Software Developer"));
    }

    @Test
    void deleteApplicationDeletesApplication() throws Exception {
        mockMvc.perform(delete("/api/applications/1"))
                .andExpect(status().isOk());

        verify(jobApplicationService).deleteApplication(1L);
    }

    @Test
    void getApplicationsForUserReturnsApplications() throws Exception {
        when(jobApplicationService.getApplicationsForUser(1L))
                .thenReturn(List.of(defaultResponse));

        mockMvc.perform(get("/api/applications/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].company").value("Xero"))
                .andExpect(jsonPath("$[0].status").value("Applied"));
    }

    @Test
    void getApplicationByIdReturnsNotFoundWhenApplicationDoesNotExist()
            throws Exception {
        when(jobApplicationService.getApplicationById(99L))
                .thenThrow(new ResourceNotFoundException(
                        "Application not found"
                ));

        mockMvc.perform(get("/api/applications/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Application not found"));
    }

    @Test
    void createApplicationReturnsCreatedApplication() throws Exception {
        JobApplicationResponse response = new JobApplicationResponse(
                1L,
                "Xero",
                "Junior Software Developer",
                "Auckland",
                "Saved",
                "Java and React role",
                LocalDate.of(2026, 8, 1),
                LocalDateTime.of(2026, 7, 24, 10, 0),
                1L,
                "zoey.xia@example.com"
        );

        when(jobApplicationService.createApplication(
                any(CreateJobApplicationRequest.class)
        )).thenReturn(response);

        String requestJson = """
                {
                  "userId": 1,
                  "company": "Xero",
                  "roleTitle": "Junior Software Developer",
                  "location": "Auckland",
                  "status": "Saved",
                  "jobDescription": "Java and React role",
                  "closingDate": "2026-08-01"
                }
                """;

        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.company").value("Xero"));
    }

    @Test
    void updateApplicationReturnsUpdatedApplication() throws Exception {
        JobApplicationResponse response = new JobApplicationResponse(
                1L,
                "Xero",
                "Software Developer",
                "Wellington",
                "Interview",
                "Updated job description",
                LocalDate.of(2026, 8, 10),
                LocalDateTime.of(2026, 7, 24, 10, 0),
                1L,
                "zoey.xia@example.com"
        );

        when(jobApplicationService.updateApplication(
                eq(1L),
                any(UpdateJobApplicationRequest.class)
        )).thenReturn(response);

        String requestJson = """
                {
                  "company": "Xero",
                  "roleTitle": "Software Developer",
                  "location": "Wellington",
                  "status": "Interview",
                  "jobDescription": "Updated job description",
                  "closingDate": "2026-08-10"
                }
                """;

        mockMvc.perform(put("/api/applications/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleTitle")
                        .value("Software Developer"))
                .andExpect(jsonPath("$.location").value("Wellington"))
                .andExpect(jsonPath("$.status").value("Interview"));
    }
}
