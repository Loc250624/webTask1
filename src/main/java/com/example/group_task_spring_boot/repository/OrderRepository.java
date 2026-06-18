package com.example.group_task_spring_boot.repository;

import com.example.group_task_spring_boot.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE o.user.id = :userId " +
           "AND oi.product.id = :productId " +
           "AND o.status = :status")
    boolean existsByUserIdAndProductIdAndStatus(
            @Param("userId") Long userId,
            @Param("productId") Long productId,
            @Param("status") String status);
}
