// Real Device Sensor Pedometer & Motion Activity Tracker
import { PhoneActivityStats } from '../types';

const STORAGE_KEY = 'lira_real_device_activity_v1';

export const INITIAL_EMPTY_ACTIVITY: PhoneActivityStats = {
  steps: 0,
  stepsGoal: 10000,
  calories: 0,
  caloriesGoal: 500,
  activeMinutes: 0,
  distanceKm: 0,
  sleepDuration: '—',
  waterMl: 0,
  waterGoalMl: 2000,
  screenTime: '—',
  lastSynced: 'Не синхронизировано',
  source: 'google_fit',
};

class PedometerService {
  private currentStats: PhoneActivityStats;
  private isListening: boolean = false;
  private lastStepTimestamp: number = 0;
  private listeners: ((stats: PhoneActivityStats) => void)[] = [];
  private activeSecondsCount: number = 0;
  private gravityFilter = { x: 0, y: 0, z: 0 };
  private alpha = 0.8;

  constructor() {
    this.currentStats = this.loadStats();
    // Auto-init sensor on modern browsers / Android
    this.initMotionSensor();
  }

  private loadStats(): PhoneActivityStats {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if date changed to reset daily steps
        const today = new Date().toDateString();
        if (parsed.savedDate !== today) {
          return {
            ...INITIAL_EMPTY_ACTIVITY,
            stepsGoal: parsed.stepsGoal || 10000,
            caloriesGoal: parsed.caloriesGoal || 500,
            waterGoalMl: parsed.waterGoalMl || 2000,
          };
        }
        return parsed;
      }
    } catch {}
    return { ...INITIAL_EMPTY_ACTIVITY };
  }

  private saveStats() {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...this.currentStats,
        savedDate: today,
      }));
    } catch {}
  }

  public getStats(): PhoneActivityStats {
    return this.currentStats;
  }

  public updateStats(updater: (prev: PhoneActivityStats) => PhoneActivityStats) {
    this.currentStats = updater(this.currentStats);
    this.saveStats();
    this.notify();
  }

  public subscribe(cb: (stats: PhoneActivityStats) => void) {
    this.listeners.push(cb);
    cb(this.currentStats);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentStats));
  }

  public async requestSensorPermission(): Promise<boolean> {
    try {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        const res = await (DeviceMotionEvent as any).requestPermission();
        if (res === 'granted') {
          this.initMotionSensor();
          return true;
        }
        return false;
      }
      this.initMotionSensor();
      return true;
    } catch {
      return false;
    }
  }

  public initMotionSensor() {
    if (this.isListening || typeof window === 'undefined') return;

    if ('ondevicemotion' in window) {
      window.addEventListener('devicemotion', this.handleMotion, { passive: true });
      this.isListening = true;
    }
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    // High-pass filter to eliminate gravity and isolate user motion spikes
    this.gravityFilter.x = this.alpha * this.gravityFilter.x + (1 - this.alpha) * acc.x;
    this.gravityFilter.y = this.alpha * this.gravityFilter.y + (1 - this.alpha) * acc.y;
    this.gravityFilter.z = this.alpha * this.gravityFilter.z + (1 - this.alpha) * acc.z;

    const userX = acc.x - this.gravityFilter.x;
    const userY = acc.y - this.gravityFilter.y;
    const userZ = acc.z - this.gravityFilter.z;

    const magnitude = Math.sqrt(userX * userX + userY * userY + userZ * userZ);

    const now = Date.now();
    // Step detection threshold: magnitude > 2.2 m/s^2 and debounce interval > 260ms (max 4 steps/sec)
    if (magnitude > 2.2 && (now - this.lastStepTimestamp) > 260) {
      this.lastStepTimestamp = now;
      this.activeSecondsCount += 1;

      const newSteps = this.currentStats.steps + 1;
      const newCalories = Math.round(newSteps * 0.04);
      const newDistance = parseFloat((newSteps * 0.00075).toFixed(2));
      const activeMinutes = Math.floor(this.activeSecondsCount / 60);

      const d = new Date();
      const timeStr = `Сегодня, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      this.currentStats = {
        ...this.currentStats,
        steps: newSteps,
        calories: newCalories,
        distanceKm: newDistance,
        activeMinutes: Math.max(this.currentStats.activeMinutes, activeMinutes),
        lastSynced: timeStr,
        source: 'device_sensors',
      };

      this.saveStats();
      this.notify();
    }
  };
}

export const pedometerService = new PedometerService();
