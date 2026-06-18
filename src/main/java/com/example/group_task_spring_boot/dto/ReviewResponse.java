package com.example.group_task_spring_boot.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long productId;
    private Long userId;
    private String username;
    private Integer rating;
    private String comment;
    private String imageUrl;
    private LocalDateTime createdAt;
}
