package com.goudsaab.backend.repository;

import com.goudsaab.backend.model.Booking;
import com.goudsaab.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findBySellerOrderByCreatedAtDesc(Seller seller);
}
