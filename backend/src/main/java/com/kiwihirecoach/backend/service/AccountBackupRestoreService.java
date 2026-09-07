package com.kiwihirecoach.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kiwihirecoach.backend.dto.CandidateProfileResponse;
import com.kiwihirecoach.backend.dto.CreateApplicationEventRequest;
import com.kiwihirecoach.backend.dto.CreateJobApplicationRequest;
import com.kiwihirecoach.backend.dto.CreateLearningGoalRequest;
import com.kiwihirecoach.backend.dto.CreateProductFeedbackRequest;
import com.kiwihirecoach.backend.dto.CreateResumeReviewRequest;
import com.kiwihirecoach.backend.dto.MockInterviewSession;
import com.kiwihirecoach.backend.dto.RestoreAccountBackupResponse;
import com.kiwihirecoach.backend.dto.SaveApplicationAnswerRequest;
import com.kiwihirecoach.backend.dto.SaveCandidateProfileRequest;
import com.kiwihirecoach.backend.dto.SaveEvidenceItemRequest;
import com.kiwihirecoach.backend.dto.SaveResumeRequest;
import com.kiwihirecoach.backend.dto.UpdateApplicationAnswersRequest;
import com.kiwihirecoach.backend.dto.UpdateApplicationDecisionRequest;
import com.kiwihirecoach.backend.dto.UpdateApplicationEvidenceRequest;
import com.kiwihirecoach.backend.dto.UpdateLearningGoalRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AccountBackupRestoreService {
    private final ObjectMapper objectMapper;
    private final Validator validator;
    private final JobApplicationService applicationService;
    private final ResumeService resumeService;
    private final ResumeReviewService reviewService;
    private final ApplicationEventService eventService;
    private final CandidateProfileService profileService;
    private final EvidenceItemService evidenceService;
    private final ApplicationAnswerService answerService;
    private final LearningGoalService goalService;
    private final ProductFeedbackService feedbackService;

    public AccountBackupRestoreService(
            ObjectMapper objectMapper,
            Validator validator,
            JobApplicationService applicationService,
            ResumeService resumeService,
            ResumeReviewService reviewService,
            ApplicationEventService eventService,
            CandidateProfileService profileService,
            EvidenceItemService evidenceService,
            ApplicationAnswerService answerService,
            LearningGoalService goalService,
            ProductFeedbackService feedbackService
    ) {
        this.objectMapper = objectMapper;
        this.validator = validator;
        this.applicationService = applicationService;
        this.resumeService = resumeService;
        this.reviewService = reviewService;
        this.eventService = eventService;
        this.profileService = profileService;
        this.evidenceService = evidenceService;
        this.answerService = answerService;
        this.goalService = goalService;
        this.feedbackService = feedbackService;
    }

    @Transactional
    public RestoreAccountBackupResponse restore(JsonNode data, Long userId) {
        requireEmptyAccount(userId);
        requireCollections(data);

        Map<Long, Long> applicationIds = new HashMap<>();
        Map<Long, Long> resumeIds = new HashMap<>();
        Map<Long, Long> evidenceIds = new HashMap<>();
        Map<Long, Long> answerIds = new HashMap<>();
        Map<Long, Long> reviewIds = new HashMap<>();

        if (data.hasNonNull("profile")) {
            profileService.saveProfile(convert(data.get("profile"), SaveCandidateProfileRequest.class), userId);
        }
        for (JsonNode item : data.withArray("applications")) {
            var created = applicationService.createApplication(convert(item, CreateJobApplicationRequest.class), userId);
            applicationIds.put(requiredId(item), created.getId());
            if (item.path("archived").asBoolean(false)) {
                applicationService.updateArchived(created.getId(), true, userId);
            }
            if (hasText(item, "decision") || hasText(item, "decisionReason")
                    || hasText(item, "strongestFit") || hasText(item, "mainConcern")) {
                applicationService.updateDecision(created.getId(), new UpdateApplicationDecisionRequest(
                        textOrNull(item, "decision"), textOrNull(item, "decisionReason"),
                        textOrNull(item, "strongestFit"), textOrNull(item, "mainConcern")
                ), userId);
            }
        }
        for (JsonNode item : data.withArray("resumes")) {
            var created = resumeService.createResume(convert(item, SaveResumeRequest.class), userId);
            resumeIds.put(requiredId(item), created.id());
        }
        for (JsonNode item : data.withArray("evidence")) {
            var created = evidenceService.createItem(convert(item, SaveEvidenceItemRequest.class), userId);
            evidenceIds.put(requiredId(item), created.id());
        }
        for (JsonNode item : data.withArray("applicationAnswers")) {
            var created = answerService.createAnswer(convert(item, SaveApplicationAnswerRequest.class), userId);
            answerIds.put(requiredId(item), created.id());
        }

        for (JsonNode item : data.withArray("reviews")) {
            Long applicationId = mapped(applicationIds, item, "applicationId");
            Long resumeId = mapped(resumeIds, item, "resumeId");
            CreateResumeReviewRequest request = new CreateResumeReviewRequest(
                    applicationId, resumeId, nullableInt(item, "score"),
                    list(item, "matched", new TypeReference<>() {}),
                    list(item, "transferable", new TypeReference<>() {}),
                    list(item, "missing", new TypeReference<>() {}),
                    list(item, "suggestions", new TypeReference<>() {}),
                    list(item, "questions", new TypeReference<>() {})
            );
            validate(request);
            var created = reviewService.createReview(request, userId);
            reviewIds.put(requiredId(item), created.id());
            List<String> answers = list(item, "answers", new TypeReference<>() {});
            if (!answers.isEmpty()) reviewService.updateAnswers(created.id(), answers, userId);
            List<String> answerStatuses = list(item, "answerStatuses", new TypeReference<>() {});
            for (int i = 0; i < answerStatuses.size(); i++) {
                if (!"Not started".equals(answerStatuses.get(i))) {
                    reviewService.updateAnswerStatus(created.id(), i, answerStatuses.get(i), userId);
                }
            }
            List<String> suggestionStatuses = list(item, "suggestionStatuses", new TypeReference<>() {});
            for (int i = 0; i < suggestionStatuses.size(); i++) {
                if (!"To do".equals(suggestionStatuses.get(i))) {
                    reviewService.updateSuggestionStatus(created.id(), i, suggestionStatuses.get(i), userId);
                }
            }
            List<MockInterviewSession> sessions = list(item, "mockInterviewSessions", new TypeReference<>() {});
            if (!sessions.isEmpty()) reviewService.updateMockInterviewSessions(created.id(), sessions, userId);
            if (!item.path("helpful").isMissingNode()
                    || hasText(item, "feedbackComment")
                    || hasText(item, "workflowIntent")) {
                reviewService.updateFeedback(
                        created.id(),
                        item.path("helpful").isBoolean() ? item.get("helpful").booleanValue() : null,
                        textOrNull(item, "feedbackComment"),
                        textOrNull(item, "workflowIntent"),
                        userId
                );
            }
        }

        int timelineEvents = 0;
        for (JsonNode timeline : data.withArray("timelines")) {
            Long applicationId = mapped(applicationIds, timeline, "applicationId");
            List<JsonNode> events = new ArrayList<>();
            timeline.withArray("events").forEach(events::add);
            events.sort(Comparator.comparing(event -> event.path("occurredAt").asText("")));
            for (JsonNode event : events) {
                eventService.createEvent(applicationId, convert(event, CreateApplicationEventRequest.class), userId);
                timelineEvents++;
            }
        }

        for (JsonNode item : data.withArray("applications")) {
            Long applicationId = mapped(applicationIds, item, "id");
            List<Long> evidence = mappedList(evidenceIds, item.path("evidenceItemIds"));
            List<Long> answers = mappedList(answerIds, item.path("applicationAnswerIds"));
            if (!evidence.isEmpty()) applicationService.updateEvidence(
                    applicationId, new UpdateApplicationEvidenceRequest(evidence), userId);
            if (!answers.isEmpty()) applicationService.updateAnswers(
                    applicationId, new UpdateApplicationAnswersRequest(answers), userId);
        }
        for (JsonNode item : data.withArray("learningGoals")) {
            Long sourceReviewId = item.path("sourceReviewId").isNumber()
                    ? reviewIds.get(item.get("sourceReviewId").longValue()) : null;
            var created = goalService.createGoal(new CreateLearningGoalRequest(
                    item.path("skill").asText(), item.path("reason").asText(""), sourceReviewId
            ), userId);
            goalService.updateGoal(created.id(), convert(item, UpdateLearningGoalRequest.class), userId);
        }
        for (JsonNode item : data.withArray("feedback")) {
            feedbackService.createFeedback(convert(item, CreateProductFeedbackRequest.class), userId);
        }

        int restoredSnapshots = 0;
        for (JsonNode item : data.withArray("applications")) {
            if (item.hasNonNull("submittedAt")) {
                applicationService.restoreSubmissionSnapshot(
                        mapped(applicationIds, item, "id"),
                        LocalDateTime.parse(item.get("submittedAt").asText()),
                        textOrNull(item, "submittedResumeName"),
                        textOrNull(item, "submittedJobDescription"),
                        textOrNull(item, "submittedResumeContent"),
                        textOrNull(item, "submittedAnswers"),
                        textOrNull(item, "submittedEvidence"),
                        userId
                );
                restoredSnapshots++;
            }
        }
        return new RestoreAccountBackupResponse(
                applicationIds.size(), resumeIds.size(), reviewIds.size(),
                timelineEvents, restoredSnapshots, 0
        );
    }

    private void requireEmptyAccount(Long userId) {
        CandidateProfileResponse profile = profileService.getProfile(userId);
        boolean profileHasContent = List.of(
                profile.targetRoles(), profile.workRights(), profile.preferredLocations(),
                profile.careerStage(), profile.technicalSkills(), profile.experienceSummary(),
                profile.starExamples()
        ).stream().anyMatch(value -> value != null && !value.isBlank());
        if (profileHasContent || !applicationService.getApplicationsForUser(userId).isEmpty()
                || !resumeService.getResumes(userId).isEmpty() || !reviewService.getReviews(userId).isEmpty()
                || !evidenceService.getItems(userId).isEmpty() || !answerService.getAnswers(userId).isEmpty()
                || !goalService.getGoals(userId).isEmpty() || !feedbackService.getFeedback(userId).isEmpty()) {
            throw new IllegalArgumentException(
                    "Restore is only available for an empty account. Export or remove the current workspace first."
            );
        }
    }

    private void requireCollections(JsonNode data) {
        if (data == null || !data.isObject()) throw new IllegalArgumentException("Invalid backup data");
        for (String name : List.of("applications", "timelines", "resumes", "reviews", "evidence",
                "applicationAnswers", "learningGoals", "feedback")) {
            if (!data.path(name).isArray()) throw new IllegalArgumentException("Backup is missing " + name);
        }
    }

    private <T> T convert(JsonNode node, Class<T> type) {
        try {
            T value = objectMapper.readerFor(type)
                    .without(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES).readValue(node);
            validate(value);
            return value;
        } catch (IOException exception) {
            throw new IllegalArgumentException("Invalid backup data", exception);
        }
    }

    private <T> void validate(T value) {
        Set<ConstraintViolation<T>> violations = validator.validate(value);
        if (!violations.isEmpty()) {
            throw new IllegalArgumentException("Invalid backup data: " + violations.iterator().next().getMessage());
        }
    }

    private <T> List<T> list(JsonNode node, String field, TypeReference<List<T>> type) {
        if (!node.path(field).isArray()) return List.of();
        return objectMapper.convertValue(node.get(field), type);
    }

    private Long requiredId(JsonNode item) {
        if (!item.path("id").isNumber()) throw new IllegalArgumentException("Backup item is missing an id");
        return item.get("id").longValue();
    }

    private Long mapped(Map<Long, Long> ids, JsonNode item, String field) {
        if (!item.path(field).isNumber()) throw new IllegalArgumentException("Backup relation is missing " + field);
        Long mapped = ids.get(item.get(field).longValue());
        if (mapped == null) throw new IllegalArgumentException("Backup contains a broken " + field + " relation");
        return mapped;
    }

    private List<Long> mappedList(Map<Long, Long> ids, JsonNode values) {
        if (!values.isArray()) return List.of();
        return objectMapper.convertValue(values, new TypeReference<List<Long>>() {}).stream()
                .map(ids::get).filter(java.util.Objects::nonNull).toList();
    }

    private Integer nullableInt(JsonNode item, String field) {
        return item.path(field).isNumber() ? item.get(field).intValue() : null;
    }

    private boolean hasText(JsonNode item, String field) {
        return item.path(field).isTextual() && !item.get(field).asText().isBlank();
    }

    private String textOrNull(JsonNode item, String field) {
        return item.path(field).isTextual() ? item.get(field).asText() : null;
    }
}
