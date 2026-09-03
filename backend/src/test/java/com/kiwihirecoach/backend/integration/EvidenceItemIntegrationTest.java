package com.kiwihirecoach.backend.integration;

import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.repository.EvidenceItemRepository;
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

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EvidenceItemIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EvidenceItemRepository evidenceItemRepository;

    @Autowired
    private JwtService jwtService;

    private String authHeader;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(new User(
                "evidence.test@example.com",
                "test-password-hash",
                LocalDateTime.now()
        ));
        authHeader = "Bearer " + jwtService.generateToken(user);
    }

    @Test
    void createEvidencePersistsAndCanBeListed() throws Exception {
        String requestJson = """
                {
                  "title": "Fixed API integration",
                  "context": "The React page could not load backend data.",
                  "action": "I checked the request URL, CORS and server logs.",
                  "result": "The application flow worked again.",
                  "skills": "Java, React, debugging"
                }
                """;

        mockMvc.perform(post("/api/evidence")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Fixed API integration"))
                .andExpect(jsonPath("$.skills").value("Java, React, debugging"));

        assertEquals(1, evidenceItemRepository.count());

        mockMvc.perform(get("/api/evidence")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].result")
                        .value("The application flow worked again."));
    }
}
