package com.example.group_task_spring_boot;

import com.example.group_task_spring_boot.dto.CheckoutItemRequest;
import com.example.group_task_spring_boot.dto.CheckoutRequest;
import com.example.group_task_spring_boot.entity.Order;
import com.example.group_task_spring_boot.entity.Product;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.repository.OrderRepository;
import com.example.group_task_spring_boot.repository.ProductRepository;
import com.example.group_task_spring_boot.repository.UserRepository;
import com.example.group_task_spring_boot.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class GroupTaskSpringBootApplicationTests {

	@Autowired
	private OrderService orderService;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private UserRepository userRepository;

	@Test
	@Transactional
	void testPlaceOrderSavesToDatabase() {
		// 1. Prepare User
		User user = userRepository.findByUsername("test_user_order").orElse(null);
		if (user == null) {
			user = User.builder()
					.username("test_user_order")
					.email("test_order@example.com")
					.password("password123")
					.build();
			user = userRepository.save(user);
		}

		// 2. Prepare Product
		Product product = Product.builder()
				.name("Test Eco Item")
				.price(15.0)
				.category("lifestyle")
				.stockQuantity(10)
				.build();
		product = productRepository.save(product);

		// 3. Prepare Checkout Request
		CheckoutRequest request = CheckoutRequest.builder()
				.customerName("John Doe")
				.customerPhone("0987654321")
				.customerEmail("john@example.com")
				.deliveryAddress("123 Green Street")
				.items(List.of(
						CheckoutItemRequest.builder()
								.productId(product.getId())
								.quantity(2)
								.build()
				))
				.build();

		// 4. Place Order
		Order savedOrder = orderService.placeOrder(request, user);

		// 5. Verifications
		assertNotNull(savedOrder.getId(), "Order ID should be generated");
		assertEquals("COMPLETED", savedOrder.getStatus());
		assertEquals(30.0, savedOrder.getTotalPrice());
		assertEquals(1, savedOrder.getOrderItems().size(), "Should have exactly 1 item");
		assertEquals(8, productRepository.findById(product.getId()).get().getStockQuantity(), "Stock should be decremented to 8");

		// 6. Verify that it exists in the repository
		Order retrieved = orderRepository.findById(savedOrder.getId()).orElse(null);
		assertNotNull(retrieved, "Order should be retrieved from repository");
		assertEquals(1, retrieved.getOrderItems().size(), "Retrieved order should contain 1 item");
		assertEquals("Test Eco Item", retrieved.getOrderItems().get(0).getProduct().getName());
	}
}
