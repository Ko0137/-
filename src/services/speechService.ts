// Speech Recognition and Text-to-Speech (TTS) Service with Native Android (Capacitor) & Web Speech API support
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeech } from '@capacitor-community/speech-recognition';

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onResult?: (transcript: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;
  private nativeAvailable: boolean | null = null;

  constructor() {
    this.initTTS();
    this.checkNativeAvailability();
  }

  private async checkNativeAvailability() {
    if (Capacitor.isNativePlatform()) {
      try {
        const { available } = await NativeSpeech.available();
        this.nativeAvailable = available;
      } catch {
        this.nativeAvailable = false;
      }
    } else {
      this.nativeAvailable = false;
    }
  }

  private initTTS() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            this.voicesLoaded = true;
            // Prefer Russian female voice or Russian voice
            const ruVoices = voices.filter(v => v.lang.startsWith('ru'));
            const femaleRu = ruVoices.find(v => 
              v.name.toLowerCase().includes('female') || 
              v.name.toLowerCase().includes('жен') ||
              v.name.toLowerCase().includes('anna') ||
              v.name.toLowerCase().includes('tatyana') ||
              v.name.toLowerCase().includes('milena') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('google')
            );
            this.currentVoice = femaleRu || ruVoices[0] || voices[0];
          }
        } catch {}
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  isSpeechRecognitionSupported(): boolean {
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    return typeof window !== 'undefined' && (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);
  }

  async startListening(handlers: SpeechRecognitionHandlers): Promise<boolean> {
    this.stopListening();

    // 1. If running on native Android (Capacitor APK)
    if (Capacitor.isNativePlatform()) {
      try {
        // Request microphone permission on Android
        const permStatus = await NativeSpeech.requestPermissions();
        if (permStatus.speechRecognition !== 'granted') {
          handlers.onError?.('Необходимо разрешение на использование микрофона в настройках Android.');
          return false;
        }

        this.isListening = true;
        handlers.onStart?.();

        // Listen for partial and final results
        const listener = await NativeSpeech.addListener('partialResults', (data: { matches: string[] }) => {
          if (data.matches && data.matches.length > 0) {
            handlers.onResult?.(data.matches[0]);
          }
        });

        const result = await NativeSpeech.start({
          language: 'ru-RU',
          maxResults: 2,
          prompt: 'Слушаю вас...',
          partialResults: false,
          popup: false,
        });

        this.isListening = false;
        handlers.onEnd?.();

        if (result.matches && result.matches.length > 0) {
          handlers.onResult?.(result.matches[0]);
        }
        return true;
      } catch (err: any) {
        this.isListening = false;
        handlers.onEnd?.();
        // If native failed, try web fallback below
        console.warn('Native speech recognition error, falling back to Web API', err);
      }
    }

    // 2. Web Speech API (Browser or WebView fallback)
    if (!this.isSpeechRecognitionSupported()) {
      handlers.onError?.('Распознавание речи не поддерживается или заблокировано. Нажмите кнопку «+» и используйте текстовый ввод или Vosk.');
      return false;
    }

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.lang = 'ru-RU';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        handlers.onStart?.();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd?.();
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errMsg = event.error === 'not-allowed'
          ? 'Доступ к микрофону заблокирован. Разрешите микрофон в настройках приложения.'
          : event.error === 'no-speech'
          ? 'Голос не обнаружен. Попробуйте еще раз.'
          : (event.error || 'Ошибка микрофона');
        handlers.onError?.(errMsg);
        handlers.onEnd?.();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          handlers.onResult?.(transcript);
        }
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      handlers.onError?.(e.message || 'Не удалось запустить микрофон');
      return false;
    }
  }

  async stopListening() {
    if (Capacitor.isNativePlatform()) {
      try {
        await NativeSpeech.stop();
        await NativeSpeech.removeAllListeners();
      } catch {}
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
  }

  speak(text: string, options: { femaleVoice?: boolean; quietMode?: boolean } = {}) {
    if (options.quietMode) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Cancel previous utterance
      window.speechSynthesis.cancel();

      // Clean text for speech synthesis
      const cleanText = text
        .replace(/•/g, '')
        .replace(/[*_~`#]/g, '')
        .replace(/https?:\/\/\S+/g, 'ссылка')
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ru-RU';

      if (!this.voicesLoaded) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const ruVoice = voices.find(v => v.lang.startsWith('ru'));
          if (ruVoice) this.currentVoice = ruVoice;
        }
      }

      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }

      // Natural speech parameters
      if (options.femaleVoice !== false) {
        utterance.pitch = 1.1;
        utterance.rate = 1.05;
      } else {
        utterance.pitch = 0.95;
        utterance.rate = 1.0;
      }

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const speechService = new SpeechService();
