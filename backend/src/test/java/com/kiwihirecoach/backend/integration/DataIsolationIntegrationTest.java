package com.kiwihirecoach.backend.integration;

import com.jayway.jsonpath.JsonPath;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * One user must never read, change or delete another user's data.
 *
 * For each resource, user A creates a record, then user B tries to update
 * and delete it by id and lists the resource. B must be refused (a 4xx
 * response), B's list must not contain A's record, and A's record must still
 * be there afterwards.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DataIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private String ownerAuth;
    private String otherAuth;

    @BeforeEach
    void setUp() {
        User owner = userRepository.save(new User(
                "isolation.owner@example.com", "hash", LocalDateTime.now()));
        User other = userRepository.save(new User(
                "isolation.other@example.com", "hash", LocalDateTime.now()));
        ownerAuth = "Bearer " + jwtService.generateToken(owner);
        otherAuth = "Bearer " + jwtService.generateToken(other);
    }

    static Stream<Arguments> resources() {
        return Stream.of(
                Arguments.of(
                        "evidence",
                        "/api/evidence",
                        """
                        {"title":"Fixed API","context":"c","action":"a",
                         "result":"r","skills":"Java"}
                        """),
                Arguments.of(
                        "applications",
                        "/api/applications",
                        """
                        {"company":"Xero","roleTitle":"Developer",
                         "location":"Auckland","status":"Saved",
                         "jobDescription":"Java role",
                         "closingDate":"2026-08-01"}
                        """),
                Arguments.of(
                        "resumes",
                        "/api/resumes",
                        """
                        {"name":"Backend CV","purpose":"Backend",
                         "content":"Built REST APIs with Java."}
                        """),
                Arguments.of(
                        "answers",
                        "/api/application-answers",
                        """
                        {"question":"Why this role?","answer":"Because.",
                         "tags":"motivation","roleTypes":"Developer"}
                        """));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("resources")
    void otherUserCannotUpdateDeleteOrListOwnersRecord(
            String name, String path, String body) throws Exception {
        String created = mockMvc.perform(post(path)
                        .header("Authorization", ownerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Number id = JsonPath.read(created, "$.id");

        mockMvc.perform(put(path + "/{id}", id.longValue())
                        .header("Authorization", otherAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(delete(path + "/{id}", id.longValue())
                        .header("Authorization", otherAuth))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(get(path).header("Authorization", otherAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get(path).header("Authorization", ownerAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("resources")
    void requestsWithoutAToken_areRejected(
            String name, String path, String body) throws Exception {
        mockMvc.perform(get(path)).andExpect(status().is4xxClientError());
        mockMvc.perform(post(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is4xxClientError());
    }
}
