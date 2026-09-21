import React, { useState, useEffect, useRef } from 'react';
import { AppTheme } from '../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  ExternalLink,
  Music,
  Radio,
  Sparkles,
  ListMusic,
  Repeat,
  Shuffle,
} from 'lucide-react';
import { triggerVibration } from '../utils/sound';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverColor: string;
  tag: string;
}

export const PLAYLIST: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Моя Волна: Умный поток',
    artist: 'Яндекс Музыка • L.I.R.A. AI',
    album: 'Персональная подборка',
    duration: 215,
    coverColor: 'from-amber-500 to-orange-600',
    tag: 'Моя Волна',
  },
  {
    id: 'track-2',
    title: 'Ночной Вайб & Синтвейв',
    artist: 'Cyber Dreamers',
    album: 'Midnight Highway',
    duration: 188,
    coverColor: 'from-indigo-600 to-purple-700',
    tag: 'Электроника',
  },
  {
    id: 'track-3',
    title: 'Инди-Драйв & Энергия',
    artist: 'Солнечный Ветер',
    album: 'Дневной Ритм',
    duration: 196,
    coverColor: 'from-emerald-500 to-teal-700',
    tag: 'Инди-Рок',
  },
  {
    id: 'track-4',
    title: 'Lo-Fi Focus & Концентрация',
    artist: 'Coffee Beats Studio',
    album: 'Study Session vol. 4',
    duration: 164,
    coverColor: 'from-blue-500 to-cyan-600',
    tag: 'Лоу-фай',
  },
  {
    id: 'track-5',
    title: 'Акустический Пульс',
    artist: 'Северное Сияние',
    album: 'Живой Звук',
    duration: 228,
    coverColor: 'from-rose-500 to-pink-700',
    tag: 'Акустика',
  },
];

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  theme?: AppTheme;
}

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
  currentTrackIndex,
  onSelectTrack,
  onNextTrack,
  onPrevTrack,
  theme = 'dark',
}) => {
  const [progress, setProgress] = useState(35); // seconds elapsed
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const currentTrack = PLAYLIST[currentTrackIndex] || PLAYLIST[0];
  const isLight = theme === 'light';
  const isIOS = theme === 'ios';

  // Advance progress simulation while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= currentTrack.duration) {
          if (isRepeat) return 0;
          onNextTrack();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration, isRepeat, onNextTrack]);

  // Reset progress when track changes
  useEffect(() => {
    setProgress(0);
  }, [currentTrackIndex]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  return (
    <div
      id="dialog_music_player_backdrop"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="dialog_music_player_container"
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isIOS
            ? 'bg-[#1C1C1E] text-white border-white/10'
            : isLight
            ? 'bg-[#F8FAF7] text-[#1E2520] border-[#D8DFD5]'
            : 'bg-[#18181A] text-white border-white/10'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Title & Close Button */}
        <div
          className={`px-4 py-3 flex items-center justify-between border-b ${
            isLight ? 'border-[#E0E6DD] bg-[#EDF1EA]' : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-black text-xs shadow-md">
              Я
            </div>
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>Яндекс Музыка</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-medium">
                  {isPlaying ? 'Играет' : 'Пауза'}
                </span>
              </div>
              <div className="text-[10px] opacity-60">Моя волна • Поток треков</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="https://music.yandex.ru"
              target="_blank"
              rel="noopener noreferrer"
              title="Открыть Яндекс Музыку"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-black/5 text-neutral-600' : 'hover:bg-white/10 text-white/70'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
              }}
              title="Закрыть окно плеера"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer font-bold ${
                isLight
                  ? 'hover:bg-black/10 text-neutral-800'
                  : 'hover:bg-white/20 text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Player Body */}
        <div className="p-5 space-y-4">
          {/* Album Art & Track Info */}
          <div className="flex items-center gap-4">
            <div
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${currentTrack.coverColor} flex items-center justify-center shadow-lg shrink-0 relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Music className="w-10 h-10 text-white/90 drop-shadow-md" />
              </div>
              {isPlaying && (
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-center gap-1 h-5">
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-3"></span>
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.1s] h-5"></span>
                  <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.2s] h-4"></span>
                  <span className="w-1 bg-white rounded-full animate-bounce h-2"></span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-500 mb-1">
                {currentTrack.tag}
              </div>
              <h3 className="font-bold text-sm truncate leading-tight mb-1">
                {currentTrack.title}
              </h3>
              <p className="text-xs opacity-70 truncate mb-1">
                {currentTrack.artist}
              </p>
              <p className="text-[11px] opacity-50 truncate">
                {currentTrack.album}
              </p>
            </div>
          </div>

          {/* Progress Timeline Scrubber */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={currentTrack.duration}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] font-mono opacity-60">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Main Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center justify-center gap-6 py-1">
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                setIsShuffle(prev => !prev);
              }}
              title="Перемешать"
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isShuffle ? 'text-amber-500' : 'opacity-40 hover:opacity-100'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('selection');
                onPrevTrack();
              }}
              title="Предыдущий трек (или голосом: «предыдущий трек»)"
              className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-95 cursor-pointer"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onTogglePlay();
              }}
              title={isPlaying ? 'Пауза' : 'Воспроизведение'}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('selection');
                onNextTrack();
              }}
              title="Следующий трек (или голосом: «следующий трек»)"
              className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-95 cursor-pointer"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                setIsRepeat(prev => !prev);
              }}
              title="Повтор трека"
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isRepeat ? 'text-amber-500' : 'opacity-40 hover:opacity-100'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 px-2">
            <button
              type="button"
              onClick={() => setIsMuted(prev => !prev)}
              className="opacity-60 hover:opacity-100 cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={e => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="flex-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[11px] font-mono opacity-60 w-8 text-right">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>

          {/* Voice Assistant Hint */}
          <div
            className={`p-2.5 rounded-xl flex items-center justify-between text-[11px] ${
              isLight ? 'bg-[#ECEEE9] text-[#2C352E]' : 'bg-white/5 text-white/70'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Голосовые команды: «следующий», «пауза», «продолжи»</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPlaylist(prev => !prev)}
              className="font-medium underline opacity-80 hover:opacity-100 cursor-pointer flex items-center gap-1"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Список ({PLAYLIST.length})</span>
            </button>
          </div>

          {/* Expandable Playlist */}
          {showPlaylist && (
            <div className="space-y-1 pt-1 max-h-40 overflow-y-auto pr-1">
              {PLAYLIST.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => {
                    triggerVibration('selection');
                    onSelectTrack(idx);
                  }}
                  className={`p-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    idx === currentTrackIndex
                      ? isLight
                        ? 'bg-[#1E4D38] text-white font-bold'
                        : 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                      : isLight
                      ? 'hover:bg-black/5 text-[#1E2520]'
                      : 'hover:bg-white/5 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-4 font-mono text-[10px] opacity-60 text-right">
                      {idx + 1}
                    </span>
                    <span className="truncate">{track.title}</span>
                  </div>
                  <span className="text-[10px] opacity-60 shrink-0 ml-2 font-mono">
                    {formatTime(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Footer: Minimize & Close */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer ${
                isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Свернуть в фон</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerVibration('tap');
                onClose();
              }}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Закрыть окно</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
