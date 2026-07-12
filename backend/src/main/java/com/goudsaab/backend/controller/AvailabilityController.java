package com.goudsaab.backend.controller;

import com.goudsaab.backend.model.Availability;
import com.goudsaab.backend.model.Seller;
import com.goudsaab.backend.repository.AvailabilityRepository;
import com.goudsaab.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private SellerRepository sellerRepository;

    public static class UpdateAvailabilityRequest {
        @NotNull(message = "Seller ID is required")
        private Long sellerId;

        private boolean morningAvailable;
        private boolean eveningAvailable;

        @Min(value = 0, message = "Stock count cannot be negative")
        private int stockCount;

        public Long getSellerId() { return sellerId; }
        public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
        public boolean isMorningAvailable() { return morningAvailable; }
        public void setMorningAvailable(boolean morningAvailable) { this.morningAvailable = morningAvailable; }
        public boolean isEveningAvailable() { return eveningAvailable; }
        public void setEveningAvailable(boolean eveningAvailable) { this.eveningAvailable = eveningAvailable; }
        public int getStockCount() { return stockCount; }
        public void setStockCount(int stockCount) { this.stockCount = stockCount; }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateAvailability(@Valid @RequestBody UpdateAvailabilityRequest payload) {
        Long sellerId = payload.getSellerId();
        boolean morning = payload.isMorningAvailable();
        boolean evening = payload.isEveningAvailable();
        int stock = payload.getStockCount();

        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seller not found"));
        }

        Seller seller = sellerOpt.get();
        LocalDate today = LocalDate.now();

        Availability availability = availabilityRepository.findBySellerAndDate(seller, today)
                .orElse(new Availability(seller, morning, evening, stock, today));

        availability.setMorningAvailable(morning);
        availability.setEveningAvailable(evening);
        availability.setStockCount(stock);

        availabilityRepository.save(availability);
        return ResponseEntity.ok(availability);
    }

    @GetMapping("/today/{sellerId}")
    public ResponseEntity<?> getTodayAvailability(@PathVariable Long sellerId) {
        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seller not found"));
        }
        
        LocalDate today = LocalDate.now();
        Optional<Availability> availability = availabilityRepository.findBySellerAndDate(sellerOpt.get(), today);
        
        if (availability.isPresent()) {
            return ResponseEntity.ok(availability.get());
        } else {
            // Return default false if not set today
            return ResponseEntity.ok(new Availability(sellerOpt.get(), false, false, 0, today));
        }
    }

    @GetMapping("/all-today")
    public ResponseEntity<List<Availability>> getAllTodayAvailability() {
        // For MVP, we might just fetch all availabilities and filter by today, or write a custom query.
        // Actually a simpler way for MVP is to just return all sellers and their status, but let's just return all today's records.
        List<Availability> all = availabilityRepository.findAll();
        LocalDate today = LocalDate.now();
        List<Availability> todayList = all.stream().filter(a -> a.getDate().equals(today)).toList();
        return ResponseEntity.ok(todayList);
    }
}
