import React from 'react';
import { Mic, Compass, Wallet, MessageSquare } from 'lucide-react';
import { triggerVibration } from '../utils/sound';
import { AppTheme, NavTab } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  theme?: AppTheme;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  theme = 'dark',
}) => {
  const isIOS = theme === 'ios';
  const isLight = theme === 'light';
  const isCyber = theme === 'cyber';

  return (
    <nav
      id="bottomNavigation"
      className={`w-full z-30 transition-all ${
        isIOS
          ? 'backdrop-blur-2xl bg-[#161618]/90 border-t border-white/10 pt-2 pb-1'
          : isCyber
          ? 'bg-[#0B0B16] border-t border-[#00F0FF]/30 py-2'
          : isLight
          ? 'bg-[#FFFFFF] border-t border-[#D8DFD5] py-2 shadow-xs'
          : 'bg-[#141416] border-t border-white/10 py-2'
      }`}
    >
      <div className="flex items-center justify-around px-3">
        {/* L.I.R.A. Chat Tab */}
        <button
          id="nav_chat"
          type="button"
          onClick={() => {
            triggerVibration('selection');
            onTabChange('chat');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            isIOS
              ? currentTab === 'chat'
                ? 'text-[#007AFF] font-semibold scale-105'
                : 'text-white/40 hover:text-white/70'
              : isCyber
              ? currentTab === 'chat'
                ? 'text-[#00F0FF] font-bold scale-105 drop-shadow-[0_0_8px_#00F0FF]'
                : 'text-white/40 hover:text-[#00F0FF]/70'
              : currentTab === 'chat'
              ? isLight
                ? 'text-[#00A352] font-bold'
                : 'text-[#00E676] font-bold'
              : isLight
              ? 'text-[#6C786E] hover:text-[#1E2520]'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          {isIOS ? (
            <MessageSquare className="w-5 h-5 mb-0.5" />
          ) : (
            <Mic className="w-5 h-5 mb-0.5" />
          )}
          <span
            className={`text-[10px] ${
              isIOS ? 'font-medium tracking-tight' : 'font-bold tracking-wider'
            }`}
          >
            {isIOS ? 'Диалог' : 'L.I.R.A.'}
          </span>
        </button>

        {/* VIBE Tab */}
        <button
          id="nav_vibe"
          type="button"
          onClick={() => {
            triggerVibration('selection');
            onTabChange('vibe');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            isIOS
              ? currentTab === 'vibe'
                ? 'text-[#34C759] font-semibold scale-105'
                : 'text-white/40 hover:text-white/70'
              : isCyber
              ? currentTab === 'vibe'
                ? 'text-[#FF007F] font-bold scale-105 drop-shadow-[0_0_8px_#FF007F]'
                : 'text-white/40 hover:text-[#FF007F]/70'
              : currentTab === 'vibe'
              ? isLight
                ? 'text-[#00A352] font-bold'
                : 'text-[#00E676] font-bold'
              : isLight
              ? 'text-[#6C786E] hover:text-[#1E2520]'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span
            className={`text-[10px] ${
              isIOS ? 'font-medium tracking-tight' : 'font-bold tracking-wider'
            }`}
          >
            VIBE
          </span>
        </button>

        {/* FINANCE Tab */}
        <button
          id="nav_finance"
          type="button"
          onClick={() => {
            triggerVibration('selection');
            onTabChange('finance');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            isIOS
              ? currentTab === 'finance'
                ? 'text-[#FF9500] font-semibold scale-105'
                : 'text-white/40 hover:text-white/70'
              : isCyber
              ? currentTab === 'finance'
                ? 'text-[#00FF88] font-bold scale-105 drop-shadow-[0_0_8px_#00FF88]'
                : 'text-white/40 hover:text-[#00FF88]/70'
              : currentTab === 'finance'
              ? isLight
                ? 'text-[#00A352] font-bold'
                : 'text-[#00E676] font-bold'
              : isLight
              ? 'text-[#6C786E] hover:text-[#1E2520]'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span
            className={`text-[10px] ${
              isIOS ? 'font-medium tracking-tight' : 'font-bold tracking-wider'
            }`}
          >
            FINANCE
          </span>
        </button>
      </div>

      {/* iOS Home Indicator Pill */}
      {isIOS && (
        <div className="w-full flex justify-center pt-1.5 pb-0.5">
          <div className="w-32 h-1 bg-white/35 rounded-full" />
        </div>
      )}
    </nav>
  );
};
