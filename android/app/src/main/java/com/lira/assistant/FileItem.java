package com.lira.assistant;

public class FileItem {
    private String name;
    private String path;
    private String size;

    public FileItem(String name, String path, String size) {
        this.name = name;
        this.path = path;
        this.size = size;
    }

    public String getName() { return name; }
    public String getPath() { return path; }
    public String getSize() { return size; }
}
