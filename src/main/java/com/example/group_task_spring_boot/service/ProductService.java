package com.example.group_task_spring_boot.service;

import com.example.group_task_spring_boot.entity.Product;
import com.example.group_task_spring_boot.exception.BadRequestException;
import com.example.group_task_spring_boot.exception.ResourceNotFoundException;
import com.example.group_task_spring_boot.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
        existingProduct.setStockQuantity(productDetails.getStockQuantity() != null ? productDetails.getStockQuantity() : 10);

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product existingProduct = getProductById(id);
        productRepository.delete(existingProduct);
    }

    // Dynamic filtering and pagination
    public Page<Product> getProducts(
            String category,
            Double minPrice,
            Double maxPrice,
            Double rating,
            String keyword,
            Pageable pageable) {
        Specification<Product> spec = buildSpecification(category, minPrice, maxPrice, rating, keyword);
        return productRepository.findAll(spec, pageable);
    }

    // Dynamic filtering without pagination
    public List<Product> getProductsList(
            String category,
            Double minPrice,
            Double maxPrice,
            Double rating,
            String keyword,
            org.springframework.data.domain.Sort sort) {
        Specification<Product> spec = buildSpecification(category, minPrice, maxPrice, rating, keyword);
        return productRepository.findAll(spec, sort);
    }

    public List<Product> getAllProductsSorted(org.springframework.data.domain.Sort sort) {
        return productRepository.findAll(sort);
    }

    // Simple search query matching keyword in name or description
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }
        Specification<Product> spec = (root, query, cb) -> {
            String matchStr = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("name")), matchStr),
                cb.like(cb.lower(root.get("description")), matchStr)
            );
        };
        return productRepository.findAll(spec);
    }

    private Specification<Product> buildSpecification(
            String category,
            Double minPrice,
            Double maxPrice,
            Double rating,
            String keyword) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (minPrice != null) {
                predicates.add(cb.ge(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.le(root.get("price"), maxPrice));
            }

            if (rating != null) {
                predicates.add(cb.ge(root.get("rating"), rating));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String matchStr = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), matchStr),
                    cb.like(cb.lower(root.get("description")), matchStr)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
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
        if (product.getStockQuantity() == null || product.getStockQuantity() < 0) {
            throw new BadRequestException("Valid stock quantity is required.");
        }
    }
}
