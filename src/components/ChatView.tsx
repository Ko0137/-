import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, AppTheme, ActiveTimer } from '../types';
import {
  Mic,
  Send,
  ArrowUp,
  Volume2,
  Timer,
  Copy,
  Check,
  RotateCcw,
  Pause,
  Play,
  Plus,
  Sparkles,
  Bot,
  SlidersHorizontal,
} from 'lucide-react';
import { triggerVibration } from '../utils/sound';
import { speechService } from '../services/speechService';

interface ChatViewProps {
  messages: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: (text: string) => void;
  isListening: boolean;
  onToggleMic: () => void;
  theme?: AppTheme;
  activeTimer?: ActiveTimer | null;
  onPauseResumeTimer?: () => void;
  onResetTimer?: () => void;
  onOpenTimer?: () => void;
  onOpenRemote?: () => void;
  onOpenActionHub?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  inputText,
  setInputText,
  onSendMessage,
  isListening,
  onToggleMic,
  theme = 'dark',
  activeTimer,
  onPauseResumeTimer,
  onResetTimer,
  onOpenTimer,
  onOpenRemote,
  onOpenActionHub,
}) => {
  const isIOS = theme === 'ios';
  const isLight = theme === 'light';
  const isCyber = theme === 'cyber';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    triggerVibration('tap');
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onOpenRemote) {
      e.preventDefault();
      triggerVibration('selection');
      onOpenRemote();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      triggerVibration('selection');
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch {}
  };

  const handleSpeakMessage = (text: string) => {
    triggerVibration('tap');
    speechService.speak(text);
  };

  const formatTimerSeconds = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="chatLayout"
      onContextMenu={handleContextMenu}
      className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${
        isIOS
          ? 'bg-[#000000] text-white'
          : isCyber
          ? 'bg-[#0A0A12] text-white'
          : isLight
          ? 'bg-[#F2F5F0] text-[#1E2520]'
          : 'bg-[#121214] text-white'
      }`}
    >
      {/* Live Timer Banner (Only shown when a timer is actively running) */}
      {activeTimer && (
        <div
          onClick={onOpenTimer}
          className={`px-3.5 py-2 flex items-center justify-between border-b cursor-pointer transition-all shrink-0 ${
            isIOS
              ? 'bg-blue-900/30 border-blue-500/30 text-white'
              : isCyber
              ? 'bg-[#00F0FF]/15 border-[#00F0FF]/30 text-[#00F0FF]'
              : isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-[#1E3A2F] border-[#00E676]/30 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 animate-spin" />
            <div>
              <span className="font-bold text-xs font-mono">
                {formatTimerSeconds(activeTimer.remainingSeconds)}
              </span>
              <span className="text-[11px] opacity-75 ml-2 truncate max-w-[140px]">
                {activeTimer.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={onPauseResumeTimer}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              {activeTimer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={onResetTimer}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Messages List Area */}
      <div
        id="recyclerViewChat"
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-80">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isCyber
                  ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[#00F0FF]/20'
                  : isLight
                  ? 'bg-[#1E4D38]/10 text-[#1E4D38] border border-[#1E4D38]/20'
                  : 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
              }`}
            >
              <Bot className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-xs">
              <h3 className="text-base font-bold tracking-tight">L.I.R.A. Assistant</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                Автономный голосовой ассистент и локальный файловый менеджер
              </p>
            </div>

            {onOpenActionHub && (
              <button
                type="button"
                onClick={() => {
                  triggerVibration('selection');
                  onOpenActionHub();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isCyber
                    ? 'bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 text-[#00F0FF] border border-[#00F0FF]/40'
                    : isLight
                    ? 'bg-[#1E4D38] hover:bg-[#163b2a] text-white'
                    : 'bg-[#1B4D3E] hover:bg-[#226350] text-white border border-emerald-500/30'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Открыть меню функций и инструментов</span>
              </button>
            )}
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in-50 duration-150`}
            >
              {msg.isUser ? (
                // User message bubble
                <div
                  className={`max-w-[82%] ml-10 p-3 shadow-md transition-all ${
                    isIOS
                      ? 'bg-gradient-to-b from-[#007AFF] to-[#0062D2] text-white rounded-2xl rounded-br-xs border border-white/20 shadow-blue-500/20'
                      : isCyber
                      ? 'bg-gradient-to-r from-[#00F0FF]/30 to-[#7000FF]/30 text-white border border-[#00F0FF]/40 rounded-2xl rounded-tr-xs shadow-lg shadow-[#00F0FF]/10'
                      : isLight
                      ? 'bg-[#1E4D38] text-white rounded-2xl rounded-tr-xs shadow-xs'
                      : 'bg-[#1B4D3E] text-white rounded-2xl rounded-tr-xs'
                  }`}
                >
                  <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-sans">
                    {msg.message}
                  </p>
                  <span className="block text-right text-[10px] mt-1 font-mono text-white/70">
                    {msg.time}
                  </span>
                </div>
              ) : (
                // Assistant message bubble
                <div
                  className={`max-w-[85%] mr-10 p-3.5 shadow-md transition-all relative ${
                    isIOS
                      ? 'bg-white/10 backdrop-blur-xl border border-white/15 text-white rounded-2xl rounded-tl-xs shadow-black/40'
                      : isCyber
                      ? 'bg-[#14142B]/90 border border-[#00F0FF]/25 text-white rounded-2xl rounded-tl-xs shadow-lg shadow-[#00F0FF]/5'
                      : isLight
                      ? 'bg-[#FFFFFF] border border-[#CBD4C8] text-[#1E2520] rounded-2xl rounded-tl-xs shadow-xs'
                      : 'bg-[#1C1C1E] border border-white/10 text-white rounded-2xl rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1 text-[11px] font-bold">
                    <span
                      className={
                        isIOS
                          ? 'text-[#00E676]'
                          : isCyber
                          ? 'text-[#00F0FF]'
                          : isLight
                          ? 'text-[#00A352]'
                          : 'text-[#00E676]'
                      }
                    >
                      L.I.R.A.
                    </span>

                    {/* Message Action icons (copy / tts speak) */}
                    <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        title="Озвучить реплику"
                        onClick={() => handleSpeakMessage(msg.message)}
                        className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="Скопировать текст"
                        onClick={() => handleCopyMessage(msg.id, msg.message)}
                        className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3 h-3 text-[#00E676]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap font-sans">
                    {msg.message}
                  </p>
                  <span
                    className={`block text-right text-[10px] mt-1 font-mono ${
                      isLight ? 'text-neutral-500' : 'text-white/40'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Minimalist, Clean Input Area with [+] Action Hub trigger */}
      <div
        id="inputLayout"
        className={`p-2.5 sm:p-3 flex items-center gap-2 border-t transition-colors shrink-0 ${
          isIOS
            ? 'bg-[#161618]/95 backdrop-blur-xl border-white/10'
            : isCyber
            ? 'bg-[#0B0B16] border-[#00F0FF]/25'
            : isLight
            ? 'bg-[#FFFFFF] border-[#D8DFD5]'
            : 'bg-[#18181A] border-white/10'
        }`}
      >
        {/* [+] Action & Tools Hub Button */}
        {onOpenActionHub && (
          <button
            type="button"
            title="Инструменты и быстрые команды (+)"
            aria-label="Меню инструментов"
            onClick={() => {
              triggerVibration('selection');
              onOpenActionHub();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isIOS
                ? 'bg-white/10 hover:bg-white/15 border border-white/15 text-white active:scale-95 shadow-sm'
                : isCyber
                ? 'bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] active:scale-95'
                : isLight
                ? 'bg-[#E8ECE5] hover:bg-[#DCE3D8] border border-[#CBD4C8] text-[#1E4D38] active:scale-95 shadow-2xs'
                : 'bg-white/10 hover:bg-white/15 border border-white/10 text-white active:scale-95'
            }`}
          >
            <Plus className="w-5 h-5 transition-transform hover:rotate-90 duration-200" />
          </button>
        )}

        {/* Text Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            id="inputMessage"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={
              isIOS
                ? 'Команда или вопрос...'
                : 'Спросить L.I.R.A. или ввести команду...'
            }
            className={`flex-1 min-h-[44px] px-4 py-2 text-sm focus:outline-none transition-all ${
              isIOS
                ? 'bg-white/10 border border-white/15 rounded-full text-white placeholder-white/40 focus:border-[#007AFF] focus:bg-white/15'
                : isCyber
                ? 'bg-[#14142B] border border-[#00F0FF]/30 rounded-xl text-white placeholder-white/40 focus:border-[#00F0FF]'
                : isLight
                ? 'bg-[#F2F5F0] border border-[#CBD4C8] rounded-xl text-[#1E2520] placeholder:text-[#889386] focus:border-[#1E4D38] shadow-2xs'
                : 'bg-[#26262A] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#00E676]'
            }`}
          />

          {/* Microphone button */}
          <button
            id="micButton"
            type="button"
            aria-label={isListening ? 'Остановить запись' : 'Голосовой ввод'}
            onClick={() => {
              triggerVibration(isListening ? 'micEnd' : 'micStart');
              onToggleMic();
            }}
            className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center transition-all cursor-pointer ${
              isIOS
                ? isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/40'
                  : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white/90 active:scale-95 shadow-sm'
                : isCyber
                ? isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] active:scale-95'
                : isListening
                ? 'bg-[#D32F2F] text-white scale-105 ring-4 ring-[#D32F2F]/40 animate-pulse'
                : isLight
                ? 'bg-[#1E4D38] hover:bg-[#163b2a] text-white active:scale-95 shadow-xs'
                : 'bg-[#1B4D3E] hover:bg-[#226350] text-white active:scale-95'
            }`}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
          </button>

          {/* Send Button (Only shown or active when text is typed) */}
          {inputText.trim() && (
            <button
              id="sendButton"
              type="submit"
              className={`w-11 h-11 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 animate-in zoom-in-95 duration-100 ${
                isIOS
                  ? 'rounded-full bg-[#007AFF] hover:bg-[#006ee6] text-white shadow-sm'
                  : isCyber
                  ? 'bg-[#00F0FF] hover:bg-[#00d0dd] text-black font-bold'
                  : isLight
                  ? 'bg-[#1E4D38] hover:bg-[#163b2a] text-white shadow-xs'
                  : 'bg-[#00E676] hover:bg-[#00c864] text-black font-bold'
              }`}
            >
              {isIOS ? <ArrowUp className="w-5 h-5" /> : <Send className="w-4 h-4" />}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
