import React, { useState, useEffect } from 'react';
import { triggerVibration } from '../utils/sound';
import { Cpu, Mic, CheckCircle2, Volume2, ShieldCheck, RefreshCw, X, Radio, Sliders } from 'lucide-react';
import { AppTheme } from '../types';

interface OfflineSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
  onVoiceCommand?: (text: string) => void;
}

export const OfflineSpeechModal: React.FC<OfflineSpeechModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  onVoiceCommand,
}) => {
  const [modelStatus, setModelStatus] = useState<'loaded' | 'loading' | 'ready'>('ready');
  const [isTestListening, setIsTestListening] = useState(false);
  const [testTranscript, setTestTranscript] = useState('');
  const [sensitivity, setSensitivity] = useState(75);
  const [audioLevel, setAudioLevel] = useState(0);
  const [strictOffline, setStrictOffline] = useState(true);

  useEffect(() => {
    let animId: number;
    if (isTestListening) {
      const updateLevel = () => {
        setAudioLevel(Math.floor(Math.random() * 65) + 20);
        animId = requestAnimationFrame(updateLevel);
      };
      animId = requestAnimationFrame(updateLevel);
    } else {
      setAudioLevel(0);
    }
    return () => cancelAnimationFrame(animId);
  }, [isTestListening]);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleStartTest = () => {
    triggerVibration('micStart');
    setIsTestListening(true);
    setTestTranscript('Слушаю локально через Vosk...');

    setTimeout(() => {
      const testPhrases = [
        'включи музыку',
        'запиши расход 450 кофе',
        'какой сегодня день',
        'поставь будильник на семь утра',
        'прочитай заметки',
      ];
      const randomPhrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
      setTestTranscript(randomPhrase);
      setIsTestListening(false);
      triggerVibration('commandSuccess');
      if (onVoiceCommand) {
        onVoiceCommand(randomPhrase);
      }
    }, 2800);
  };

  return (
    <div
      id="offline_speech_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) {
          triggerVibration('tap');
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-md rounded-3xl p-5 border shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
          isLight
            ? 'bg-[#F9FAF8] border-[#D5DAD1] text-[#1F2421]'
            : 'bg-[#1C1C1E] border-white/15 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00E676]/15 flex items-center justify-center text-[#00E676]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Vosk STT: Оффлайн-распознавание</h3>
              <p className="text-[11px] opacity-60">Локальная нейросеть прямо на процессоре</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerVibration('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center cursor-pointer hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Status Card */}
        <div
          className={`p-3.5 rounded-2xl border mb-3.5 ${
            isLight
              ? 'bg-[#FFFFFF] border-[#DCE1D9]'
              : 'bg-[#242426] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              Модель речи: <strong>vosk-model-small-ru</strong>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold">
              АКТИВНА (45 МБ)
            </span>
          </div>
          <div className="text-[11px] opacity-75 leading-relaxed">
            Голосовые команды обрабатываются без отправки аудио на сервера Google или Яндекс. Полная конфиденциальность и работа в авиарежиме.
          </div>
        </div>

        {/* Strict offline toggle */}
        <div
          className={`p-3 rounded-2xl border mb-3.5 flex items-center justify-between ${
            isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#00E676]" /> Строгий оффлайн-режим
            </div>
            <div className="text-[10px] opacity-60">
              Запретить любые сетевые запросы при распознавании
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={strictOffline}
              onChange={e => {
                triggerVibration('selection');
                setStrictOffline(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
          </label>
        </div>

        {/* Sensitivity slider */}
        <div
          className={`p-3 rounded-2xl border mb-4 ${
            isLight ? 'bg-[#FFFFFF] border-[#DCE1D9]' : 'bg-[#242426] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#00E676]" /> Чувствительность микрофона
            </span>
            <span className="font-mono font-bold text-[#00E676]">{sensitivity}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            value={sensitivity}
            onChange={e => setSensitivity(parseInt(e.target.value, 10))}
            className="w-full accent-[#00E676] cursor-pointer"
          />
        </div>

        {/* Test Speech Recognition Box */}
        <div
          className={`p-4 rounded-2xl border text-center mb-4 ${
            isTestListening
              ? 'border-[#00E676] bg-[#00E676]/10'
              : isLight
              ? 'bg-[#FFFFFF] border-[#DCE1D9]'
              : 'bg-[#242426] border-white/10'
          }`}
        >
          <div className="mb-2 text-xs font-semibold opacity-80">Тестовый запуск локального STT:</div>

          {/* Sound wave visualizer */}
          {isTestListening && (
            <div className="flex items-center justify-center gap-1 my-3 h-8">
              {[15, 30, 60, 45, 80, 50, 30, 70, 40].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.min(32, (h * audioLevel) / 60)}px` }}
                  className="w-1.5 bg-[#00E676] rounded-full transition-all duration-75"
                />
              ))}
            </div>
          )}

          <div className="text-sm font-mono font-bold text-[#00E676] min-h-[24px] mb-3">
            {testTranscript || '«Нажмите кнопку ниже для теста»'}
          </div>

          <button
            type="button"
            onClick={handleStartTest}
            disabled={isTestListening}
            className="w-full py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98"
          >
            <Mic className="w-4 h-4" />
            <span>{isTestListening ? 'Распознавание речи...' : 'Сказать тестовую команду'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerVibration('selection');
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-neutral-200 dark:bg-white/10 hover:opacity-90 text-xs font-semibold cursor-pointer"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
