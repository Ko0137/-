package com.lira.assistant;

public class HabitItem {
    private int id;
    private String title;
    private String target;
    private int streak;
    private boolean isCompleted;

    public HabitItem(int id, String title, String target, int streak, boolean isCompleted) {
        this.id = id;
        this.title = title;
        this.target = target;
        this.streak = streak;
        this.isCompleted = isCompleted;
    }

    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getTarget() { return target; }
    public int getStreak() { return streak; }
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
    public void setStreak(int streak) { this.streak = streak; }
}
