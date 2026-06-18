package com.example.group_task_spring_boot.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    @NotBlank(message = "Customer name is required.")
    private String customerName;

    @NotBlank(message = "Phone number is required.")
    private String customerPhone;

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    private String customerEmail;

    @NotBlank(message = "Delivery address is required.")
    private String deliveryAddress;

    @NotEmpty(message = "Cart items cannot be empty.")
    private List<CheckoutItemRequest> items;
}
