package com.example.group_task_spring_boot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Email or Username is required.")
    private String emailOrUsername;

    @NotBlank(message = "Password is required.")
    private String password;
}
