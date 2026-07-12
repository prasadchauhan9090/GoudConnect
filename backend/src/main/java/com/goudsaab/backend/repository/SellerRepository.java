package com.goudsaab.backend.repository;

import com.goudsaab.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByPhone(String phone);
}
