package com.kiwihirecoach.backend.controller;

import com.kiwihirecoach.backend.dto.CreateProductFeedbackRequest;
import com.kiwihirecoach.backend.dto.ProductFeedbackResponse;
import com.kiwihirecoach.backend.service.ProductFeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class ProductFeedbackController {
    private final ProductFeedbackService productFeedbackService;

    public ProductFeedbackController(
            ProductFeedbackService productFeedbackService
    ) {
        this.productFeedbackService = productFeedbackService;
    }

    @GetMapping
    public List<ProductFeedbackResponse> getFeedback(
            Authentication authentication
    ) {
        return productFeedbackService.getFeedback(
                currentUserId(authentication)
        );
    }

    @PostMapping
    public ResponseEntity<ProductFeedbackResponse> createFeedback(
            @Valid @RequestBody CreateProductFeedbackRequest request,
            Authentication authentication
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productFeedbackService.createFeedback(
                        request,
                        currentUserId(authentication)
                ));
    }

    private Long currentUserId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }
}
