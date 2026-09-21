import React, { useState } from 'react';
import { FileText, X, Plus, Trash2 } from 'lucide-react';
import { triggerVibration } from '../utils/sound';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string[];
  onAddNote: (text: string) => void;
  onDeleteNote: (index: number) => void;
  onClearNotes: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onDeleteNote,
  onClearNotes,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    triggerVibration(30);
    onAddNote(inputText.trim());
    setInputText('');
  };

  return (
    <div
      id="modal_notes_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#1E1E1E] text-white rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 bg-[#1B4D3E] flex items-center justify-between text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <FileText className="w-4 h-4 text-[#00E676]" />
            <span>Заметки L.I.R.A. ({notes.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Note Input */}
        <form onSubmit={handleAdd} className="p-3 bg-[#242424] border-b border-white/10 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Новая заметка (или скажите «Заметка ...»)"
            className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-3 py-2 bg-[#00E676] hover:bg-[#00c864] disabled:opacity-40 text-black font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Notes List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs">
              Заметок пока нет. Скажите: «Заметка купить молоко»
            </div>
          ) : (
            notes.map((note, index) => (
              <div
                key={index}
                className="p-3 bg-[#252525] rounded-xl border border-white/5 flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[#00E676] font-bold text-xs mt-0.5">•</span>
                  <p className="text-xs text-white/90 leading-relaxed break-words">{note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerVibration(20);
                    onDeleteNote(index);
                  }}
                  className="text-red-400 hover:text-red-300 p-1 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {notes.length > 0 && (
          <div className="p-3 bg-[#181818] border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                triggerVibration(40);
                onClearNotes();
              }}
              className="w-full py-2 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/30 rounded-lg text-xs font-medium transition-colors"
            >
              Очистить все заметки
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
