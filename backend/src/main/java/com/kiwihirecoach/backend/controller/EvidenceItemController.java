package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.EvidenceItemResponse;
import com.kiwihirecoach.backend.dto.SaveEvidenceItemRequest;
import com.kiwihirecoach.backend.service.EvidenceItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceItemController {
    private final EvidenceItemService evidenceItemService;

    public EvidenceItemController(EvidenceItemService evidenceItemService) {
        this.evidenceItemService = evidenceItemService;
    }

    @GetMapping
    public List<EvidenceItemResponse> getItems(Authentication authentication) {
        return evidenceItemService.getItems(currentUserId(authentication));
    }

    @PostMapping
    public ResponseEntity<EvidenceItemResponse> createItem(
            @Valid @RequestBody SaveEvidenceItemRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                evidenceItemService.createItem(request, currentUserId(authentication))
        );
    }

    @PutMapping("/{itemId}")
    public EvidenceItemResponse updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody SaveEvidenceItemRequest request,
            Authentication authentication
    ) {
        return evidenceItemService.updateItem(
                itemId,
                request,
                currentUserId(authentication)
        );
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long itemId,
            Authentication authentication
    ) {
        evidenceItemService.deleteItem(itemId, currentUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
