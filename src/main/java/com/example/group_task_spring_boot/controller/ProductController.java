package com.example.group_task_spring_boot.controller;

import com.example.group_task_spring_boot.entity.Product;
import com.example.group_task_spring_boot.entity.User;
import com.example.group_task_spring_boot.exception.UnauthorizedException;
import com.example.group_task_spring_boot.service.AuthService;
import com.example.group_task_spring_boot.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String keyword) {

        // Parse sorting
        Sort sortOrder = Sort.unsorted();
        if (sort != null && !sort.trim().isEmpty()) {
            String[] parts = sort.split(",");
            String property = parts[0].trim();
            String direction = parts.length > 1 ? parts[1].trim() : "asc";
            
            // Map frontend's snake_case or standard fields
            if (property.equalsIgnoreCase("created_at") || property.equalsIgnoreCase("createdAt")) {
                property = "createdAt";
            } else if (property.equalsIgnoreCase("price")) {
                property = "price";
            } else if (property.equalsIgnoreCase("rating")) {
                property = "rating";
            }
            
            sortOrder = Sort.by(
                direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                property
            );
        }

        // If page is specified, return paginated structure
        if (page != null) {
            int pageSize = size != null ? size : 10;
            Pageable pageable = PageRequest.of(page, pageSize, sortOrder);
            Page<Product> productPage = productService.getProducts(
                    category, minPrice, maxPrice, rating, keyword, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("content", productPage.getContent());
            response.put("totalPages", productPage.getTotalPages());
            response.put("totalElements", productPage.getTotalElements());
            response.put("currentPage", productPage.getNumber());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            // No pagination requested: return list directly (with filters & sorting applied)
            List<Product> products;
            if (category != null || minPrice != null || maxPrice != null || rating != null || keyword != null) {
                products = productService.getProductsList(category, minPrice, maxPrice, rating, keyword, sortOrder);
            } else {
                if (sortOrder.isSorted()) {
                    products = productService.getAllProductsSorted(sortOrder);
                } else {
                    products = productService.getAllProducts();
                }
            }
            return new ResponseEntity<>(products, HttpStatus.OK);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productService.searchProducts(keyword);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestHeader(value = "Authorization", required = false) String token,
            @Valid @RequestBody Product product) {
        // Require authentication for creation
        User user = authService.validateTokenAndGetUser(token);
        if (user.getRole() == null || !"admin".equalsIgnoreCase(user.getRole().getName())) {
            throw new UnauthorizedException("Access denied: Admin role required.");
        }
        Product createdProduct = productService.createProduct(product);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id,
            @Valid @RequestBody Product productDetails) {
        // Require authentication for update
        User user = authService.validateTokenAndGetUser(token);
        if (user.getRole() == null || !"admin".equalsIgnoreCase(user.getRole().getName())) {
            throw new UnauthorizedException("Access denied: Admin role required.");
        }
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id) {
        // Require authentication for delete
        User user = authService.validateTokenAndGetUser(token);
        if (user.getRole() == null || !"admin".equalsIgnoreCase(user.getRole().getName())) {
            throw new UnauthorizedException("Access denied: Admin role required.");
        }
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
