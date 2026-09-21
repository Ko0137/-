package com.lira.assistant;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import java.util.List;

public class AppLauncherHelper {
    private final Context context;

    public AppLauncherHelper(Context context) {
        this.context = context;
    }

    public boolean launchAppByName(String queryName) {
        PackageManager pm = context.getPackageManager();
        String lowerQuery = queryName.toLowerCase().trim();

        // Specific package shortcuts
        if (lowerQuery.contains("телеграм") || lowerQuery.contains("telegram") || lowerQuery.contains("тг")) {
            if (tryLaunchPackage("org.telegram.messenger")) return true;
        }
        if (lowerQuery.contains("ватсап") || lowerQuery.contains("whatsapp") || lowerQuery.contains("вацап")) {
            if (tryLaunchPackage("com.whatsapp")) return true;
        }
        if (lowerQuery.contains("вконтакте") || lowerQuery.contains("vk") || lowerQuery.contains("вк")) {
            if (tryLaunchPackage("com.vkontakte.android")) return true;
        }
        if (lowerQuery.contains("ютуб") || lowerQuery.contains("youtube")) {
            if (tryLaunchPackage("com.google.android.youtube")) return true;
        }
        if (lowerQuery.contains("музык") || lowerQuery.contains("яндекс муз")) {
            if (tryLaunchPackage("ru.yandex.music")) return true;
        }
        if (lowerQuery.contains("карт") || lowerQuery.contains("2гис") || lowerQuery.contains("gis")) {
            if (tryLaunchPackage("ru.yandex.yandexmaps") || tryLaunchPackage("com.google.android.apps.maps")) return true;
        }

        // Generic search through installed applications
        List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        for (ApplicationInfo appInfo : packages) {
            String appLabel = pm.getApplicationLabel(appInfo).toString().toLowerCase();
            if (appLabel.contains(lowerQuery)) {
                Intent intent = pm.getLaunchIntentForPackage(appInfo.packageName);
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                    return true;
                }
            }
        }
        return false;
    }

    private boolean tryLaunchPackage(String packageName) {
        PackageManager pm = context.getPackageManager();
        Intent intent = pm.getLaunchIntentForPackage(packageName);
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            return true;
        }
        return false;
    }
}
