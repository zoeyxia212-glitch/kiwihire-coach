package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.EvidenceItemResponse;
import com.kiwihirecoach.backend.dto.SaveEvidenceItemRequest;
import com.kiwihirecoach.backend.entity.EvidenceItem;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.EvidenceItemRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.entity.JobApplication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvidenceItemService {
    private final EvidenceItemRepository evidenceItemRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public EvidenceItemService(
            EvidenceItemRepository evidenceItemRepository,
            UserRepository userRepository,
            JobApplicationRepository jobApplicationRepository
    ) {
        this.evidenceItemRepository = evidenceItemRepository;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    public List<EvidenceItemResponse> getItems(Long userId) {
        return evidenceItemRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EvidenceItemResponse createItem(
            SaveEvidenceItemRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        EvidenceItem item = new EvidenceItem(
                user,
                clean(request.title()),
                clean(request.context()),
                clean(request.action()),
                clean(request.result()),
                clean(request.skills())
        );
        return toResponse(evidenceItemRepository.save(item));
    }

    public EvidenceItemResponse updateItem(
            Long itemId,
            SaveEvidenceItemRequest request,
            Long userId
    ) {
        EvidenceItem item = findOwnedItem(itemId, userId);
        item.update(
                clean(request.title()),
                clean(request.context()),
                clean(request.action()),
                clean(request.result()),
                clean(request.skills())
        );
        return toResponse(evidenceItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long itemId, Long userId) {
        EvidenceItem item = findOwnedItem(itemId, userId);
        List<JobApplication> applications =
                jobApplicationRepository.findByEvidenceItemsId(itemId);
        applications.forEach(application -> {
            application.getEvidenceItems().remove(item);
            jobApplicationRepository.save(application);
        });
        evidenceItemRepository.delete(item);
    }

    private EvidenceItem findOwnedItem(Long itemId, Long userId) {
        return evidenceItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Evidence item not found"
                ));
    }

    private String clean(String value) {
        return value.trim();
    }

    private EvidenceItemResponse toResponse(EvidenceItem item) {
        return new EvidenceItemResponse(
                item.getId(),
                item.getTitle(),
                item.getContext(),
                item.getAction(),
                item.getResult(),
                item.getSkills(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
