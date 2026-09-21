// Real Android & Web Permissions Manager
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { triggerVibration, soundManager } from '../utils/sound';

export interface AppPermissionStatus {
  microphone: boolean;
  camera: boolean;
  activity: boolean;
  storage: boolean;
  notifications: boolean;
}

const STORAGE_PERMISSIONS_KEY = 'lira_granted_permissions_v1';

class PermissionService {
  private status: AppPermissionStatus = {
    microphone: false,
    camera: false,
    activity: false,
    storage: false,
    notifications: false,
  };

  constructor() {
    this.loadSavedStatus();
  }

  private loadSavedStatus() {
    try {
      const saved = localStorage.getItem(STORAGE_PERMISSIONS_KEY);
      if (saved) {
        this.status = { ...this.status, ...JSON.parse(saved) };
      }
    } catch {}
  }

  private saveStatus() {
    try {
      localStorage.setItem(STORAGE_PERMISSIONS_KEY, JSON.stringify(this.status));
    } catch {}
  }

  public getStatus(): AppPermissionStatus {
    return { ...this.status };
  }

  public async requestMicrophone(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const sr = SpeechRecognition as any;
        if (typeof sr.hasPermissions === 'function') {
          const has = await sr.hasPermissions();
          if (!has?.permission) {
            const req = await sr.requestPermissions();
            this.status.microphone = !!(req?.permission || req?.speechRecognition);
          } else {
            this.status.microphone = true;
          }
        } else if (typeof sr.hasPermission === 'function') {
          const has = await sr.hasPermission();
          if (!has?.permission) {
            const req = await sr.requestPermission();
            this.status.microphone = !!(req?.permission || req?.speechRecognition);
          } else {
            this.status.microphone = true;
          }
        }
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        this.status.microphone = true;
      }
    } catch {
      this.status.microphone = false;
    }
    this.saveStatus();
    return this.status.microphone;
  }

  public async requestCamera(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        this.status.camera = true;
      } else {
        this.status.camera = true;
      }
    } catch {
      this.status.camera = false;
    }
    this.saveStatus();
    return this.status.camera;
  }

  public async requestActivitySensors(): Promise<boolean> {
    try {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        const res = await (DeviceMotionEvent as any).requestPermission();
        this.status.activity = res === 'granted';
      } else {
        this.status.activity = 'ondevicemotion' in window;
      }
    } catch {
      this.status.activity = false;
    }
    this.saveStatus();
    return this.status.activity;
  }

  public async requestNotifications(): Promise<boolean> {
    try {
      if ('Notification' in window) {
        const res = await Notification.requestPermission();
        this.status.notifications = res === 'granted';
      }
    } catch {
      this.status.notifications = false;
    }
    this.saveStatus();
    return this.status.notifications;
  }

  public markStorageGranted() {
    this.status.storage = true;
    this.saveStatus();
  }

  public async requestAllCorePermissions(): Promise<AppPermissionStatus> {
    await this.requestMicrophone();
    await this.requestActivitySensors();
    await this.requestCamera();
    await this.requestNotifications();
    this.status.storage = true;
    this.saveStatus();
    triggerVibration('commandSuccess');
    soundManager.playCommandSuccess();
    return this.getStatus();
  }
}

export const permissionService = new PermissionService();
