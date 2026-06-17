package com.example.group_task_spring_boot.service;

import com.example.group_task_spring_boot.entity.Product;
import com.example.group_task_spring_boot.exception.BadRequestException;
import com.example.group_task_spring_boot.exception.ResourceNotFoundException;
import com.example.group_task_spring_boot.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }

    public Product createProduct(Product product) {
        validateProduct(product);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product existingProduct = getProductById(id);
        
        validateProduct(productDetails);

        existingProduct.setName(productDetails.getName());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setPrice(productDetails.getPrice());
        existingProduct.setCategory(productDetails.getCategory());
        existingProduct.setImageUrl(productDetails.getImageUrl());
        existingProduct.setRating(productDetails.getRating() != null ? productDetails.getRating() : 5.0);
        existingProduct.setReviewCount(productDetails.getReviewCount() != null ? productDetails.getReviewCount() : 0);

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product existingProduct = getProductById(id);
        productRepository.delete(existingProduct);
    }

    private void validateProduct(Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new BadRequestException("Product name is required.");
        }
        if (product.getPrice() == null || product.getPrice() < 0) {
            throw new BadRequestException("Valid product price is required.");
        }
        if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
            throw new BadRequestException("Product category is required.");
        }
    }
}
