package com.goudconnect.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;

@Entity
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private Seller seller;

    private boolean morningAvailable;
    private boolean eveningAvailable;

    @Min(value = 0, message = "Stock count cannot be negative")
    private int stockCount;

    private LocalDate date;

    public Availability() {
    }

    public Availability(Seller seller, boolean morningAvailable, boolean eveningAvailable, int stockCount, LocalDate date) {
        this.seller = seller;
        this.morningAvailable = morningAvailable;
        this.eveningAvailable = eveningAvailable;
        this.stockCount = stockCount;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Seller getSeller() {
        return seller;
    }

    public void setSeller(Seller seller) {
        this.seller = seller;
    }

    public boolean isMorningAvailable() {
        return morningAvailable;
    }

    public void setMorningAvailable(boolean morningAvailable) {
        this.morningAvailable = morningAvailable;
    }

    public boolean isEveningAvailable() {
        return eveningAvailable;
    }

    public void setEveningAvailable(boolean eveningAvailable) {
        this.eveningAvailable = eveningAvailable;
    }

    public int getStockCount() {
        return stockCount;
    }

    public void setStockCount(int stockCount) {
        this.stockCount = stockCount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
