package com.am.beans;

import java.math.BigDecimal;

/**
 * Domain object representing booking transaction
 */
public class Transaction {
    private String eventId;
    private String eventType;
    private BigDecimal eventBasePrice;

    public Transaction(String eventId, String eventType, BigDecimal eventBasePrice, int quantity) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.eventBasePrice = eventBasePrice;
        this.quantity = quantity;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    private int quantity;

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public BigDecimal getEventBasePrice() {
        return eventBasePrice;
    }

    public void setEventBasePrice(BigDecimal eventBasePrice) {
        this.eventBasePrice = eventBasePrice;
    }
}
