package com.goudsaab.backend.controller;

import com.goudsaab.backend.model.Seller;
import com.goudsaab.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired
    private SellerRepository sellerRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Seller seller) {
        if (sellerRepository.findByPhone(seller.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number already registered"));
        }
        Seller savedSeller = sellerRepository.save(seller);
        return ResponseEntity.ok(savedSeller);
    }

    public static class LoginRequest {
        private String phone;
        private String password;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest credentials) {
        String phone = credentials.getPhone();
        String password = credentials.getPassword();
        
        if (phone == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone and password are required"));
        }
        
        Optional<Seller> sellerOpt = sellerRepository.findByPhone(phone);
        if (sellerOpt.isPresent() && password.equals(sellerOpt.get().getPassword())) {
            // For MVP, we'll just return the seller object instead of a JWT
            return ResponseEntity.ok(sellerOpt.get());
        }
        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return sellerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Seller>> getAllSellers() {
        return ResponseEntity.ok(sellerRepository.findAll());
    }

    public static class RateRequest {
        private Double rating;
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateSeller(@PathVariable Long id, @RequestBody RateRequest request) {
        Optional<Seller> sellerOpt = sellerRepository.findById(id);
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seller not found"));
        }
        Seller seller = sellerOpt.get();
        
        Double currentTotal = (seller.getRating() != null ? seller.getRating() : 0.0) * (seller.getRatingCount() != null ? seller.getRatingCount() : 0);
        Integer newCount = (seller.getRatingCount() != null ? seller.getRatingCount() : 0) + 1;
        Double newRating = (currentTotal + request.getRating()) / newCount;
        
        // Round to 1 decimal place
        newRating = Math.round(newRating * 10.0) / 10.0;
        
        seller.setRating(newRating);
        seller.setRatingCount(newCount);
        
        sellerRepository.save(seller);
        return ResponseEntity.ok(seller);
    }
}
