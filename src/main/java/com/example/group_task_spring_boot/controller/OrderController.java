package com.example.group_task_spring_boot.controller;

import com.example.group_task_spring_boot.dto.CheckoutRequest;
import com.example.group_task_spring_boot.entity.Order;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.service.AuthService;
import com.example.group_task_spring_boot.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @RequestHeader(value = "Authorization", required = false) String token,
            @Valid @RequestBody CheckoutRequest request) {
        
        User user = null;
        if (token != null && !token.trim().isEmpty() && !token.equalsIgnoreCase("null")) {
            try {
                user = authService.validateTokenAndGetUser(token);
            } catch (Exception e) {
                // Ignore invalid tokens for checkout, fallback to guest
            }
        }

        Order order = orderService.placeOrder(request, user);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }
}
