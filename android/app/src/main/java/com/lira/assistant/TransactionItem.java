package com.lira.assistant;

public class TransactionItem {
    private int id;
    private String title;
    private String category;
    private double amount;
    private boolean isIncome;
    private String date;

    public TransactionItem(int id, String title, String category, double amount, boolean isIncome, String date) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.isIncome = isIncome;
        this.date = date;
    }

    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public double getAmount() { return amount; }
    public boolean isIncome() { return isIncome; }
    public String getDate() { return date; }
}
