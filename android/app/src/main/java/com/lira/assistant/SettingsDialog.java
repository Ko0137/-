package com.lira.assistant;

import android.Manifest;
import android.app.Activity;
import android.app.Dialog;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Window;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.android.material.switchmaterial.SwitchMaterial;

public class SettingsDialog extends Dialog {
    private final Activity activity;
    private static final String PREFS_NAME = "lira_settings";

    public SettingsDialog(@NonNull Activity activity) {
        super(activity);
        this.activity = activity;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_settings);

        SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        SwitchMaterial switchMic = findViewById(R.id.switch_mic);
        SwitchMaterial switchPedometer = findViewById(R.id.switch_pedometer);
        SwitchMaterial switchCamera = findViewById(R.id.switch_camera);
        SwitchMaterial switchOverlay = findViewById(R.id.switch_overlay);

        RadioGroup rgIconTheme = findViewById(R.id.rg_icon_theme);
        RadioButton rbEmerald = findViewById(R.id.rb_icon_emerald);
        RadioButton rbViolet = findViewById(R.id.rb_icon_violet);
        RadioButton rbGold = findViewById(R.id.rb_icon_gold);
        RadioButton rbBlue = findViewById(R.id.rb_icon_blue);

        Button btnClose = findViewById(R.id.btn_close_settings);

        // Check current permission status & preferences
        boolean micGranted = ContextCompat.checkSelfPermission(activity, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
        switchMic.setChecked(micGranted && prefs.getBoolean("pref_mic", false));

        boolean pedometerGranted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            pedometerGranted = ContextCompat.checkSelfPermission(activity, Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
        }
        switchPedometer.setChecked(pedometerGranted && prefs.getBoolean("pref_pedometer", false));

        boolean cameraGranted = ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
        switchCamera.setChecked(cameraGranted && prefs.getBoolean("pref_camera", false));

        boolean overlayGranted = Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(activity);
        switchOverlay.setChecked(overlayGranted && prefs.getBoolean("pref_overlay", false));

        // Selected Icon Theme
        String currentIcon = prefs.getString("pref_icon_theme", "emerald");
        if ("violet".equals(currentIcon)) rbViolet.setChecked(true);
        else if ("gold".equals(currentIcon)) rbGold.setChecked(true);
        else if ("blue".equals(currentIcon)) rbBlue.setChecked(true);
        else rbEmerald.setChecked(true);

        // Switch Listeners
        switchMic.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("pref_mic", isChecked).apply();
            if (isChecked && ContextCompat.checkSelfPermission(activity, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.RECORD_AUDIO}, 101);
            } else {
                Toast.makeText(activity, isChecked ? "Микрофон включен" : "Микрофон отключен", Toast.LENGTH_SHORT).show();
            }
        });

        switchPedometer.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("pref_pedometer", isChecked).apply();
            if (isChecked && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (ContextCompat.checkSelfPermission(activity, Manifest.permission.ACTIVITY_RECOGNITION) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.ACTIVITY_RECOGNITION}, 102);
                }
            } else {
                Toast.makeText(activity, isChecked ? "Шагомер включен" : "Шагомер отключен", Toast.LENGTH_SHORT).show();
            }
        });

        switchCamera.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("pref_camera", isChecked).apply();
            if (isChecked && ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.CAMERA}, 103);
            } else {
                Toast.makeText(activity, isChecked ? "Доступ к камере включен" : "Доступ к камере отключен", Toast.LENGTH_SHORT).show();
            }
        });

        switchOverlay.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("pref_overlay", isChecked).apply();
            if (isChecked) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(activity)) {
                    Toast.makeText(activity, "Разрешите показ поверх других окон в настройках", Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + activity.getPackageName()));
                    activity.startActivity(intent);
                } else {
                    startFloatingService();
                }
            } else {
                try {
                    Intent intent = new Intent(activity, FloatingWidgetService.class);
                    activity.stopService(intent);
                    Toast.makeText(activity, "Плавающий виджет отключен", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        // App Icon Theme Selector
        rgIconTheme.setOnCheckedChangeListener((group, checkedId) -> {
            String selectedIcon = "emerald";
            if (checkedId == R.id.rb_icon_violet) selectedIcon = "violet";
            else if (checkedId == R.id.rb_icon_gold) selectedIcon = "gold";
            else if (checkedId == R.id.rb_icon_blue) selectedIcon = "blue";

            prefs.edit().putString("pref_icon_theme", selectedIcon).apply();
            setAppIcon(activity, selectedIcon);
        });

        btnClose.setOnClickListener(v -> dismiss());
    }

    private void startFloatingService() {
        try {
            Intent intent = new Intent(activity, FloatingWidgetService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                activity.startForegroundService(intent);
            } else {
                activity.startService(intent);
            }
            Toast.makeText(activity, "Плавающий виджет запущен!", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            e.printStackTrace();
            Toast.makeText(activity, "Разрешите фоновую работу для виджета", Toast.LENGTH_SHORT).show();
        }
    }

    public static void setAppIcon(Context context, String iconTheme) {
        try {
            PackageManager pm = context.getPackageManager();
            String pkg = context.getPackageName();

            ComponentName defaultComp = new ComponentName(pkg, pkg + ".MainActivity");
            ComponentName violetComp = new ComponentName(pkg, pkg + ".IconVioletAlias");
            ComponentName goldComp = new ComponentName(pkg, pkg + ".IconGoldAlias");
            ComponentName blueComp = new ComponentName(pkg, pkg + ".IconBlueAlias");

            pm.setComponentEnabledSetting(defaultComp,
                    "emerald".equals(iconTheme) ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP);

            pm.setComponentEnabledSetting(violetComp,
                    "violet".equals(iconTheme) ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP);

            pm.setComponentEnabledSetting(goldComp,
                    "gold".equals(iconTheme) ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP);

            pm.setComponentEnabledSetting(blueComp,
                    "blue".equals(iconTheme) ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP);

            Toast.makeText(context, "Иконка приложения изменена!", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
