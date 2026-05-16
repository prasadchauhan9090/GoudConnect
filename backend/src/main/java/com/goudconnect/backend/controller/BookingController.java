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

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SellerRepository sellerRepository;

    public static class CreateBookingRequest {
        private String customerName;
        private String customerPhone;
        private int quantity;
        private String pickupTime;
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
    public ResponseEntity<?> createBooking(@RequestBody CreateBookingRequest request) {
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
