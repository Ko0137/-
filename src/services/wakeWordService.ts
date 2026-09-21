// Wake Word Detection & Continuous Listening Service for "Лира"
import { speechService, SpeechRecognitionHandlers } from './speechService';
import { soundManager, triggerVibration } from '../utils/sound';

export type WakeWordCallback = (command: string) => void;
export type WakeWordStatusCallback = (isListening: boolean, message?: string) => void;

class WakeWordService {
  private isRunning: boolean = false;
  private onCommandCallback: WakeWordCallback | null = null;
  private onStatusCallback: WakeWordStatusCallback | null = null;
  private restartTimeout: number | null = null;

  public isEnabled(): boolean {
    return this.isRunning;
  }

  public start(onCommand: WakeWordCallback, onStatus?: WakeWordStatusCallback) {
    this.isRunning = true;
    this.onCommandCallback = onCommand;
    this.onStatusCallback = onStatus || null;
    this.listenLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    speechService.stopListening();
    this.onStatusCallback?.(false, 'Фоновый режим остановлен');
  }

  private async listenLoop() {
    if (!this.isRunning) return;

    this.onStatusCallback?.(true, 'Ожидание фразы «Лира...»');

    try {
      await speechService.startListening({
        onStart: () => {
          if (this.isRunning) {
            this.onStatusCallback?.(true, 'Слушаю... (скажите «Лира ...»)');
          }
        },
        onEnd: () => {
          // If still enabled, restart loop after short pause
          if (this.isRunning) {
            this.scheduleRestart(600);
          }
        },
        onError: (err) => {
          // If error is no-speech or network, keep trying
          if (this.isRunning) {
            this.scheduleRestart(1200);
          }
        },
        onResult: (transcript) => {
          this.handleTranscript(transcript);
        },
      });
    } catch {
      if (this.isRunning) {
        this.scheduleRestart(1500);
      }
    }
  }

  private handleTranscript(rawTranscript: string) {
    if (!this.isRunning) return;

    const lower = rawTranscript.toLowerCase().trim();
    const wakePatterns = [
      /^лира[,.\s]*/i,
      /^lira[,.\s]*/i,
      /^лирочка[,.\s]*/i,
      /^эй\s+лира[,.\s]*/i,
      /^слушай\s+лира[,.\s]*/i,
      /^ассистент[,.\s]*/i,
    ];

    let matched = false;
    let command = '';

    for (const pat of wakePatterns) {
      if (pat.test(lower)) {
        matched = true;
        command = rawTranscript.replace(pat, '').trim();
        break;
      }
    }

    // Also check if "лира" is anywhere in the sentence
    if (!matched && (lower.includes('лира') || lower.includes('lira'))) {
      matched = true;
      const idx = lower.indexOf('лира') !== -1 ? lower.indexOf('лира') : lower.indexOf('lira');
      command = rawTranscript.slice(idx + 4).trim();
    }

    if (matched) {
      triggerVibration('commandSuccess');
      soundManager.playCommandSuccess();
      this.onStatusCallback?.(true, `Команда: ${command || 'Слушаю вас'}`);
      this.onCommandCallback?.(command || 'привет');
    }

    // Continue loop
    if (this.isRunning) {
      this.scheduleRestart(800);
    }
  }

  private scheduleRestart(delayMs: number) {
    if (!this.isRunning) return;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    this.restartTimeout = window.setTimeout(() => {
      this.listenLoop();
    }, delayMs);
  }
}

export const wakeWordService = new WakeWordService();
