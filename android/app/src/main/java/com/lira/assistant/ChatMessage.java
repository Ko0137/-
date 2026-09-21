package com.lira.assistant;

public class ChatMessage {
    private String id;
    private String text;
    private boolean isUser;
    private String time;

    public ChatMessage(String id, String text, boolean isUser, String time) {
        this.id = id;
        this.text = text;
        this.isUser = isUser;
        this.time = time;
    }

    public String getId() { return id; }
    public String getText() { return text; }
    public boolean isUser() { return isUser; }
    public String getTime() { return time; }
}
