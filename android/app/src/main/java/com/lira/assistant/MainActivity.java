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
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

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
                if (viewPager.getCurrentItem() != 0) viewPager.setCurrentItem(0, true);
                return true;
            } else if (itemId == R.id.nav_vibe) {
                if (viewPager.getCurrentItem() != 1) viewPager.setCurrentItem(1, true);
                return true;
            } else if (itemId == R.id.nav_finance) {
                if (viewPager.getCurrentItem() != 2) viewPager.setCurrentItem(2, true);
                return true;
            }
            return false;
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
