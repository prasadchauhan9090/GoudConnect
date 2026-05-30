package com.goudconnect.backend.controller;

import com.goudconnect.backend.model.Booking;
import com.goudconnect.backend.model.Seller;
import com.goudconnect.backend.repository.BookingRepository;
import com.goudconnect.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SellerRepository sellerRepository;

    public static class CreateBookingRequest {
        @NotBlank(message = "Customer name is required")
        private String customerName;

        @NotBlank(message = "Customer phone number is required")
        @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
        private String customerPhone;

        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 10, message = "Quantity cannot exceed 10")
        private int quantity;

        @NotBlank(message = "Pickup time is required")
        private String pickupTime;

        @NotNull(message = "Seller ID is required")
        private Long sellerId;

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public String getPickupTime() { return pickupTime; }
        public void setPickupTime(String pickupTime) { this.pickupTime = pickupTime; }
        public Long getSellerId() { return sellerId; }
        public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        Optional<Seller> sellerOpt = sellerRepository.findById(request.getSellerId());
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seller not found"));
        }

        Booking booking = new Booking();
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setQuantity(request.getQuantity());
        booking.setPickupTime(request.getPickupTime());
        booking.setSeller(sellerOpt.get());

        bookingRepository.save(booking);

        return ResponseEntity.ok(Map.of("message", "Booking created successfully", "booking", booking));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getBookingsBySeller(@PathVariable Long sellerId) {
        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Seller not found"));
        }

        List<Booking> bookings = bookingRepository.findBySellerOrderByCreatedAtDesc(sellerOpt.get());
        return ResponseEntity.ok(bookings);
    }
}
