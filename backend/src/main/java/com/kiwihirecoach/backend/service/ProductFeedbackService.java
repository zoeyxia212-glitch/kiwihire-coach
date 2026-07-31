package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.CreateProductFeedbackRequest;
import com.kiwihirecoach.backend.dto.ProductFeedbackResponse;
import com.kiwihirecoach.backend.entity.ProductFeedback;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.exception.ResourceNotFoundException;
import com.kiwihirecoach.backend.repository.ProductFeedbackRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductFeedbackService {
    private final ProductFeedbackRepository productFeedbackRepository;
    private final UserRepository userRepository;

    public ProductFeedbackService(
            ProductFeedbackRepository productFeedbackRepository,
            UserRepository userRepository
    ) {
        this.productFeedbackRepository = productFeedbackRepository;
        this.userRepository = userRepository;
    }

    public List<ProductFeedbackResponse> getFeedback(Long userId) {
        return productFeedbackRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductFeedbackResponse createFeedback(
            CreateProductFeedbackRequest request,
            Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"
                ));
        ProductFeedback feedback = new ProductFeedback(
                user,
                request.category(),
                request.rating(),
                normalize(request.page()),
                request.wouldUseAgain(),
                request.message().trim()
        );

        return toResponse(productFeedbackRepository.save(feedback));
    }

    private ProductFeedbackResponse toResponse(ProductFeedback feedback) {
        return new ProductFeedbackResponse(
                feedback.getId(),
                feedback.getCategory(),
                feedback.getRating(),
                feedback.getPage(),
                feedback.getWouldUseAgain(),
                feedback.getMessage(),
                feedback.getCreatedAt()
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
