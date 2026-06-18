package com.example.group_task_spring_boot.controller;

import com.example.group_task_spring_boot.dto.ReviewRequest;
import com.example.group_task_spring_boot.dto.ReviewResponse;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.exception.UnauthorizedException;
import com.example.group_task_spring_boot.service.AuthService;
import com.example.group_task_spring_boot.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(
            @RequestHeader(value = "Authorization", required = false) String token,
            @Valid @RequestBody ReviewRequest request) {
        
        if (token == null || token.trim().isEmpty()) {
            throw new UnauthorizedException("Unauthorized: Session token required to write reviews.");
        }
        User user = authService.validateTokenAndGetUser(token);
        ReviewResponse response = reviewService.submitReview(request, user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getProductReviews(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @GetMapping("/check-eligibility")
    public ResponseEntity<Boolean> checkEligibility(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam Long productId) {
        if (token == null || token.trim().isEmpty() || token.equalsIgnoreCase("null")) {
            return new ResponseEntity<>(false, HttpStatus.OK);
        }
        try {
            User user = authService.validateTokenAndGetUser(token);
            boolean eligible = reviewService.checkEligibility(user.getId(), productId);
            return new ResponseEntity<>(eligible, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(false, HttpStatus.OK);
        }
    }
}
