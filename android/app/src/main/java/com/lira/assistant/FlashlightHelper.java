package com.lira.assistant;

import android.content.Context;
import android.hardware.camera2.CameraManager;

public class FlashlightHelper {
    private final Context context;
    private boolean isTorchOn = false;

    public FlashlightHelper(Context context) {
        this.context = context;
    }

    public boolean toggleFlashlight() {
        CameraManager cameraManager = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
        try {
            if (cameraManager != null) {
                String cameraId = cameraManager.getCameraIdList()[0];
                isTorchOn = !isTorchOn;
                cameraManager.setTorchMode(cameraId, isTorchOn);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isTorchOn;
    }

    public boolean isTorchOn() {
        return isTorchOn;
    }
}
