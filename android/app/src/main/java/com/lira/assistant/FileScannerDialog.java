package com.lira.assistant;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Environment;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class FileScannerDialog extends Dialog {
    private RecyclerView rvFiles;
    private FilesAdapter adapter;
    private List<FileItem> fileList = new ArrayList<>();

    public FileScannerDialog(@NonNull Context context) {
        super(context);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_file_scanner);

        rvFiles = findViewById(R.id.rv_files);
        Button btnScanNow = findViewById(R.id.btn_scan_now);
        EditText etSearch = findViewById(R.id.et_search_files);

        adapter = new FilesAdapter(fileList);
        rvFiles.setLayoutManager(new LinearLayoutManager(getContext()));
        rvFiles.setAdapter(adapter);

        btnScanNow.setOnClickListener(v -> scanStorage());
        scanStorage();
    }

    private void scanStorage() {
        fileList.clear();
        File externalStorage = Environment.getExternalStorageDirectory();
        if (externalStorage != null && externalStorage.exists()) {
            scanDirectory(externalStorage);
        }
        adapter.notifyDataSetChanged();
    }

    private void scanDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File f : files) {
            if (f.isDirectory()) {
                if (!f.getName().startsWith(".")) {
                    scanDirectory(f);
                }
            } else {
                String name = f.getName().toLowerCase();
                if (name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".txt") || name.endsWith(".jpg") || name.endsWith(".mp3")) {
                    fileList.add(new FileItem(f.getName(), f.getAbsolutePath(), (f.length() / 1024) + " KB"));
                }
            }
            if (fileList.size() >= 50) break; // Limit for performance preview
        }
    }
}
