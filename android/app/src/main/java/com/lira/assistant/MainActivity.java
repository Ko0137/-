package com.lira.assistant;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.widget.ImageButton;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;
import androidx.viewpager2.widget.ViewPager2;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private ViewPager2 viewPager;
    private BottomNavigationView bottomNav;
    private FlashlightHelper flashlightHelper;
    private AppLauncherHelper appLauncherHelper;

    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register global uncaught exception handler for native crashes
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(@NonNull Thread thread, @NonNull Throwable throwable) {
                try {
                    android.content.SharedPreferences prefs = getSharedPreferences("lira_settings", MODE_PRIVATE);
                    java.io.StringWriter sw = new java.io.StringWriter();
                    java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                    throwable.printStackTrace(pw);
                    String stackTrace = sw.toString();

                    prefs.edit()
                         .putString("native_crash_message", throwable.getMessage() != null ? throwable.getMessage() : "Unknown Native Error")
                         .putString("native_crash_stack", stackTrace)
                         .putLong("native_crash_time", System.currentTimeMillis())
                         .apply();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                // Terminate cleanly
                System.exit(1);
            }
        });

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Check for cached native crash report from previous launch
        try {
            android.content.SharedPreferences prefs = getSharedPreferences("lira_settings", MODE_PRIVATE);
            if (prefs.contains("native_crash_message")) {
                String msg = prefs.getString("native_crash_message", "Unknown Error");
                String stack = prefs.getString("native_crash_stack", "No stack trace");
                long time = prefs.getLong("native_crash_time", 0);
                
                java.util.Date date = new java.util.Date(time);
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault());
                String dateStr = sdf.format(date);

                androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
                builder.setTitle("⚠️ Отчет о крахе L.I.R.A. (Native)");
                builder.setMessage("Приложение обнаружило критический сбой при предыдущем запуске:\n\n" +
                        "[Ошибка]: " + msg + "\n\n" +
                        "[Время]: " + dateStr + "\n\n" +
                        "[Стек]:\n" + stack);
                
                builder.setPositiveButton("Очистить и закрыть", (dialog, id) -> {
                    prefs.edit()
                         .remove("native_crash_message")
                         .remove("native_crash_stack")
                         .remove("native_crash_time")
                         .apply();
                });
                
                builder.setNeutralButton("Копировать", (dialog, id) -> {
                    try {
                        android.content.ClipboardManager clipboard = (android.content.ClipboardManager) getSystemService(android.content.Context.CLIPBOARD_SERVICE);
                        android.content.ClipData clip = android.content.ClipData.newPlainText("Lira Native Crash", "Error: " + msg + "\nTime: " + dateStr + "\nStack:\n" + stack);
                        if (clipboard != null) {
                            clipboard.setPrimaryClip(clip);
                            Toast.makeText(MainActivity.this, "Отчет скопирован!", Toast.LENGTH_SHORT).show();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
                
                builder.setCancelable(false);
                builder.show();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Reset running background states on startup so everything must be started manually
        try {
            android.content.SharedPreferences prefs = getSharedPreferences("lira_settings", MODE_PRIVATE);
            prefs.edit()
                 .putBoolean("pref_pedometer", false)
                 .putBoolean("pref_overlay", false)
                 .putBoolean("pref_mic", false)
                 .apply();
        } catch (Exception e) {
            e.printStackTrace();
        }

        viewPager = findViewById(R.id.view_pager);
        bottomNav = findViewById(R.id.bottom_navigation);

        flashlightHelper = new FlashlightHelper(this);
        appLauncherHelper = new AppLauncherHelper(this);

        setupViewPagerAndNavigation();
        setupTopBarActions();
    }

    public FlashlightHelper getFlashlightHelper() {
        return flashlightHelper;
    }

    public AppLauncherHelper getAppLauncherHelper() {
        return appLauncherHelper;
    }

    private void requestNativePermissions() {
        try {
            List<String> permissions = new ArrayList<>();
            permissions.add(Manifest.permission.RECORD_AUDIO);
            permissions.add(Manifest.permission.CAMERA);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                permissions.add(Manifest.permission.ACTIVITY_RECOGNITION);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }

            List<String> ungranted = new ArrayList<>();
            for (String p : permissions) {
                if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                    ungranted.add(p);
                }
            }

            if (!ungranted.isEmpty()) {
                ActivityCompat.requestPermissions(this, ungranted.toArray(new String[0]), PERMISSION_REQUEST_CODE);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            Toast.makeText(this, "Разрешения L.I.R.A. применены", Toast.LENGTH_SHORT).show();
        }
    }

    private void setupViewPagerAndNavigation() {
        viewPager.setAdapter(new FragmentStateAdapter(this) {
            @NonNull
            @Override
            public Fragment createFragment(int position) {
                switch (position) {
                    case 0: return new LiraFragment();
                    case 1: return new VibeFragment();
                    case 2: return new FinanceFragment();
                    default: return new LiraFragment();
                }
            }

            @Override
            public int getItemCount() {
                return 3;
            }
        });

        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                super.onPageSelected(position);
                int targetId = R.id.nav_chat;
                if (position == 1) targetId = R.id.nav_vibe;
                else if (position == 2) targetId = R.id.nav_finance;

                if (bottomNav != null && bottomNav.getSelectedItemId() != targetId) {
                    bottomNav.setSelectedItemId(targetId);
                }
            }
        });

        bottomNav.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_chat) {
                if (viewPager.getCurrentItem() != 0) viewPager.setCurrentItem(0, false);
            } else if (itemId == R.id.nav_vibe) {
                if (viewPager.getCurrentItem() != 1) viewPager.setCurrentItem(1, false);
            } else if (itemId == R.id.nav_finance) {
                if (viewPager.getCurrentItem() != 2) viewPager.setCurrentItem(2, false);
            }
            return true;
        });
    }

    private void setupTopBarActions() {
        ImageButton btnTorch = findViewById(R.id.btn_torch);
        ImageButton btnFiles = findViewById(R.id.btn_files);
        ImageButton btnSettings = findViewById(R.id.btn_settings);

        btnTorch.setOnClickListener(v -> {
            boolean isOn = flashlightHelper.toggleFlashlight();
            Toast.makeText(this, isOn ? "🔦 Фонарик включен" : "💡 Фонарик выключен", Toast.LENGTH_SHORT).show();
        });

        btnFiles.setOnClickListener(v -> {
            FileScannerDialog dialog = new FileScannerDialog(this);
            dialog.show();
        });

        btnSettings.setOnClickListener(v -> {
            SettingsDialog dialog = new SettingsDialog(this);
            dialog.show();
        });
    }
}
