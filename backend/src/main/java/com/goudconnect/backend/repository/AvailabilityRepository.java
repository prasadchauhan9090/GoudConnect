package com.goudconnect.backend.repository;

import com.goudconnect.backend.model.Availability;
import com.goudconnect.backend.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    Optional<Availability> findBySellerAndDate(Seller seller, LocalDate date);
}
