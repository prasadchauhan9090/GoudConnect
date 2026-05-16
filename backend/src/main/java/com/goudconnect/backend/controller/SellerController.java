package com.goudconnect.backend.controller;

import com.goudconnect.backend.model.Seller;
import com.goudconnect.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired
    private SellerRepository sellerRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Seller seller) {
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
}
