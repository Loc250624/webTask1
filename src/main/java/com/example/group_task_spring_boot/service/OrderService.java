package com.example.group_task_spring_boot.service;

import com.example.group_task_spring_boot.dto.CheckoutItemRequest;
import com.example.group_task_spring_boot.dto.CheckoutRequest;
import com.example.group_task_spring_boot.entity.Order;
import com.example.group_task_spring_boot.entity.OrderItem;
import com.example.group_task_spring_boot.entity.Product;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.exception.BadRequestException;
import com.example.group_task_spring_boot.repository.OrderRepository;
import com.example.group_task_spring_boot.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Order placeOrder(CheckoutRequest request, User user) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order items cannot be empty.");
        }

        double totalPrice = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .user(user)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .deliveryAddress(request.getDeliveryAddress())
                .status("COMPLETED")
                .totalPrice(0.0) // updated below
                .build();

        for (CheckoutItemRequest itemReq : request.getItems()) {
            Product product = productService.getProductById(itemReq.getProductId());
            
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new BadRequestException("Sản phẩm " + product.getName() + " không đủ số lượng tồn kho.");
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .price(product.getPrice())
                    .build();

            orderItems.add(orderItem);
            totalPrice += product.getPrice() * itemReq.getQuantity();
        }

        order.setOrderItems(orderItems);
        order.setTotalPrice(totalPrice);

        return orderRepository.save(order);
    }
}
