package com.example.group_task_spring_boot.service;

import com.example.group_task_spring_boot.dto.ReviewRequest;
import com.example.group_task_spring_boot.dto.ReviewResponse;
import com.example.group_task_spring_boot.entity.Product;
import com.example.group_task_spring_boot.entity.Review;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.exception.BadRequestException;
import com.example.group_task_spring_boot.repository.OrderRepository;
import com.example.group_task_spring_boot.repository.ProductRepository;
import com.example.group_task_spring_boot.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    public boolean checkEligibility(Long userId, Long productId) {
        return orderRepository.existsByUserIdAndProductIdAndStatus(userId, productId, "COMPLETED");
    }

    @Transactional
    public ReviewResponse submitReview(ReviewRequest request, User user) {
        // Eligibility check
        if (!checkEligibility(user.getId(), request.getProductId())) {
            throw new BadRequestException("Bạn cần mua sản phẩm trước khi đánh giá.");
        }

        Product product = productService.getProductById(request.getProductId());

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .imageUrl(request.getImageUrl())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update product statistics
        updateProductRatingStats(product.getId());

        return mapToResponse(savedReview);
    }

    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void updateProductRatingStats(Long productId) {
        Product product = productService.getProductById(productId);
        
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Long reviewCount = reviewRepository.getReviewCountByProductId(productId);

        product.setRating(avgRating != null ? avgRating : 5.0);
        product.setReviewCount(reviewCount != null ? reviewCount.intValue() : 0);

        productRepository.save(product);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrl(review.getImageUrl())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
