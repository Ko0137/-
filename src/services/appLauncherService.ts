// Installed Apps Scanner & Deep Link Launcher for Android / Pixel 8
import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { LaunchableApp } from '../types';

export interface InstalledPhoneApp {
  id: string;
  name: string;
  packageName?: string;
  uriScheme: string;
  webFallback: string;
  category: 'Общение' | 'Медиа' | 'Система' | 'Карты' | 'Утилиты' | 'Покупки';
  keywords: string[];
  icon: string;
  isCustom?: boolean;
}

const STORAGE_CUSTOM_APPS_KEY = 'lira_installed_custom_apps_v1';

export const DEFAULT_ANDROID_APPS: InstalledPhoneApp[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    packageName: 'org.telegram.messenger',
    uriScheme: 'tg://',
    webFallback: 'https://web.telegram.org',
    category: 'Общение',
    keywords: ['телеграм', 'телеграмм', 'тг', 'мессенджер', 'сообщения'],
    icon: 'Send',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    uriScheme: 'whatsapp://',
    webFallback: 'https://web.whatsapp.com',
    category: 'Общение',
    keywords: ['ватсап', 'вацап', 'whatsapp'],
    icon: 'MessageSquare',
  },
  {
    id: 'vk',
    name: 'ВКонтакте',
    packageName: 'com.vkontakte.android',
    uriScheme: 'vk://',
    webFallback: 'https://vk.com',
    category: 'Общение',
    keywords: ['вк', 'вконтакте', 'вконтакт'],
    icon: 'Users',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    uriScheme: 'vnd.youtube://',
    webFallback: 'https://www.youtube.com',
    category: 'Медиа',
    keywords: ['ютуб', 'ютубчик', 'youtube', 'видео', 'ролики'],
    icon: 'Youtube',
  },
  {
    id: 'yandex_music',
    name: 'Яндекс Музыка',
    packageName: 'ru.yandex.music',
    uriScheme: 'yandexmusic://',
    webFallback: 'https://music.yandex.ru',
    category: 'Медиа',
    keywords: ['яндекс музыка', 'я музыка', 'яндекс треки', 'музыка'],
    icon: 'Music',
  },
  {
    id: 'google_maps',
    name: 'Google Карты',
    packageName: 'com.google.android.apps.maps',
    uriScheme: 'geo:0,0?q=',
    webFallback: 'https://www.google.com/maps',
    category: 'Карты',
    keywords: ['гугл карты', 'карты', 'навигатор', 'маршрут', 'пробки'],
    icon: 'MapPin',
  },
  {
    id: 'yandex_maps',
    name: 'Яндекс Карты',
    packageName: 'ru.yandex.yandexmaps',
    uriScheme: 'yandexmaps://',
    webFallback: 'https://yandex.ru/maps',
    category: 'Карты',
    keywords: ['яндекс карты', 'я карты', 'яндекс навигатор'],
    icon: 'Navigation',
  },
  {
    id: 'chrome',
    name: 'Chrome / Браузер',
    packageName: 'com.android.chrome',
    uriScheme: 'googlechrome://',
    webFallback: 'https://www.google.com',
    category: 'Утилиты',
    keywords: ['хром', 'браузер', 'интернет', 'гугл', 'веб'],
    icon: 'Globe',
  },
  {
    id: 'camera',
    name: 'Камера',
    packageName: 'com.google.android.GoogleCamera',
    uriScheme: 'camera:',
    webFallback: '',
    category: 'Система',
    keywords: ['камера', 'фото', 'видео', 'снимок', 'сфотать'],
    icon: 'Camera',
  },
  {
    id: 'calculator',
    name: 'Калькулятор',
    packageName: 'com.google.android.calculator',
    uriScheme: 'calc:',
    webFallback: '',
    category: 'Утилиты',
    keywords: ['калькулятор', 'счет', 'вычисления', 'посчитать'],
    icon: 'Calculator',
  },
  {
    id: 'clock',
    name: 'Часы / Будильник',
    packageName: 'com.google.android.deskclock',
    uriScheme: 'clock:',
    webFallback: '',
    category: 'Система',
    keywords: ['часы', 'будильник', 'таймер', 'секундомер'],
    icon: 'Clock',
  },
  {
    id: 'gallery',
    name: 'Google Фото / Галерея',
    packageName: 'com.google.android.apps.photos',
    uriScheme: 'photos:',
    webFallback: 'https://photos.google.com',
    category: 'Медиа',
    keywords: ['галерея', 'фотографии', 'фото', 'гугл фото', 'альбом'],
    icon: 'Image',
  },
  {
    id: 'ozon',
    name: 'Ozon',
    packageName: 'ru.ozon.app.android',
    uriScheme: 'ozon://',
    webFallback: 'https://www.ozon.ru',
    category: 'Покупки',
    keywords: ['озон', 'ozon', 'покупки', 'магазин'],
    icon: 'ShoppingBag',
  },
  {
    id: 'wb',
    name: 'Wildberries',
    packageName: 'com.wildberries.ru',
    uriScheme: 'wildberries://',
    webFallback: 'https://www.wildberries.ru',
    category: 'Покупки',
    keywords: ['вб', 'вайлдберриз', 'вайлдбериз', 'wildberries'],
    icon: 'ShoppingBag',
  },
];

class AppLauncherService {
  private customApps: InstalledPhoneApp[] = [];

  constructor() {
    this.loadCustomApps();
  }

  private loadCustomApps() {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_APPS_KEY);
      if (saved) {
        this.customApps = JSON.parse(saved);
      }
    } catch {}
  }

  private saveCustomApps() {
    try {
      localStorage.setItem(STORAGE_CUSTOM_APPS_KEY, JSON.stringify(this.customApps));
    } catch {}
  }

  public getAllApps(): InstalledPhoneApp[] {
    return [...DEFAULT_ANDROID_APPS, ...this.customApps];
  }

  public addCustomApp(app: Omit<InstalledPhoneApp, 'id' | 'isCustom'>): InstalledPhoneApp {
    const newApp: InstalledPhoneApp = {
      ...app,
      id: `custom_${Date.now()}`,
      isCustom: true,
    };
    this.customApps.push(newApp);
    this.saveCustomApps();
    return newApp;
  }

  public deleteCustomApp(id: string) {
    this.customApps = this.customApps.filter(a => a.id !== id);
    this.saveCustomApps();
  }

  public findAppByQuery(query: string): InstalledPhoneApp | null {
    const lower = query.toLowerCase().trim().replace(/^(открой|запусти|включи|покажи)\s+/i, '');
    const all = this.getAllApps();

    // 1. Exact or keyword match
    for (const app of all) {
      if (
        app.name.toLowerCase() === lower ||
        app.keywords.some(k => lower.includes(k) || k.includes(lower)) ||
        lower.includes(app.name.toLowerCase())
      ) {
        return app;
      }
    }
    return null;
  }

  public async launchApp(app: InstalledPhoneApp): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        if (app.uriScheme) {
          try {
            await AppLauncher.openUrl({ url: app.uriScheme });
            return true;
          } catch {}
        }
        if (app.packageName) {
          try {
            const intentUri = `intent:#Intent;package=${app.packageName};action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`;
            await AppLauncher.openUrl({ url: intentUri });
            return true;
          } catch {}
        }
      }

      // Web/Fallback
      if (app.uriScheme && !app.uriScheme.startsWith('http')) {
        window.location.href = app.uriScheme;
        return true;
      }

      if (app.webFallback) {
        window.open(app.webFallback, '_blank');
        return true;
      }
    } catch (err) {
      if (app.webFallback) {
        window.open(app.webFallback, '_blank');
        return true;
      }
    }
    return false;
  }
}

export const appLauncherService = new AppLauncherService();
