package com.lira.assistant;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import androidx.core.content.ContextCompat;

public class PedometerHelper implements SensorEventListener {
    private final Context context;
    private final SensorManager sensorManager;
    private final Sensor stepSensor;
    private OnStepCountChangeListener listener;
    private int stepOffset = 0;
    private int currentSteps = 0;

    public interface OnStepCountChangeListener {
        void onStepCountChanged(int steps, double calories, double distanceKm);
    }

    public PedometerHelper(Context context) {
        this.context = context.getApplicationContext();
        sensorManager = (SensorManager) this.context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        } else {
            stepSensor = null;
        }
    }

    public void startListening(OnStepCountChangeListener listener) {
        this.listener = listener;
        if (sensorManager == null || stepSensor == null) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED) {
                    sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_UI);
                }
            } else {
                sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_UI);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void stopListening() {
        if (sensorManager != null) {
            try {
                sensorManager.unregisterListener(this);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void resetSteps() {
        stepOffset = currentSteps;
        if (listener != null) {
            listener.onStepCountChanged(0, 0, 0);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int rawSteps = (int) event.values[0];
            if (stepOffset == 0) {
                stepOffset = rawSteps;
            }
            currentSteps = Math.max(0, rawSteps - stepOffset);
            double calories = currentSteps * 0.04;
            double distanceKm = (currentSteps * 0.7) / 1000.0;

            if (listener != null) {
                listener.onStepCountChanged(currentSteps, calories, distanceKm);
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
