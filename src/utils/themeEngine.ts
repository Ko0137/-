// Theme Engine & Dynamic Styling for L.I.R.A.
import { AppTheme } from '../types';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  accentColor: string;
  accentHex: string;
  glowColor: string;
  bgClass: string;
  cardBg: string;
  borderAccent: string;
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'cyber',
    name: 'Изумрудный Неон',
    subtitle: 'Классический киберпанк L.I.R.A.',
    accentColor: 'text-[#00E676]',
    accentHex: '#00E676',
    glowColor: 'rgba(0, 230, 118, 0.25)',
    bgClass: 'bg-[#121214]',
    cardBg: 'bg-[#1A1A1E]',
    borderAccent: 'border-[#00E676]/30',
  },
  {
    id: 'purple',
    name: 'Аметистовый Неон',
    subtitle: 'Глубокий кибер-фиолетовый',
    accentColor: 'text-[#B388FF]',
    accentHex: '#B388FF',
    glowColor: 'rgba(179, 136, 255, 0.25)',
    bgClass: 'bg-[#130D1E]',
    cardBg: 'bg-[#1E142F]',
    borderAccent: 'border-[#B388FF]/30',
  },
  {
    id: 'cobalt',
    name: 'Кобальтовый Сапфир',
    subtitle: 'Глубокий футуристичный синий',
    accentColor: 'text-[#00B0FF]',
    accentHex: '#00B0FF',
    glowColor: 'rgba(0, 176, 255, 0.25)',
    bgClass: 'bg-[#0A111E]',
    cardBg: 'bg-[#121F36]',
    borderAccent: 'border-[#00B0FF]/30',
  },
  {
    id: 'amber',
    name: 'Солнечный Янтарь',
    subtitle: 'Теплый золотой неон',
    accentColor: 'text-[#FFD600]',
    accentHex: '#FFD600',
    glowColor: 'rgba(255, 214, 0, 0.25)',
    bgClass: 'bg-[#181308]',
    cardBg: 'bg-[#281F10]',
    borderAccent: 'border-[#FFD600]/30',
  },
  {
    id: 'crimson',
    name: 'Багровый Рубин',
    subtitle: 'Агрессивный кибер-красный',
    accentColor: 'text-[#FF1744]',
    accentHex: '#FF1744',
    glowColor: 'rgba(255, 23, 68, 0.25)',
    bgClass: 'bg-[#180A0E]',
    cardBg: 'bg-[#291219]',
    borderAccent: 'border-[#FF1744]/30',
  },
  {
    id: 'monochrome',
    name: 'OLED Титан',
    subtitle: 'Черно-белый чистый минимализм',
    accentColor: 'text-[#FFFFFF]',
    accentHex: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.2)',
    bgClass: 'bg-[#080808]',
    cardBg: 'bg-[#161616]',
    borderAccent: 'border-white/25',
  },
  {
    id: 'ios',
    name: 'Cupertino Glass',
    subtitle: 'Стеклянный блик iOS',
    accentColor: 'text-[#007AFF]',
    accentHex: '#007AFF',
    glowColor: 'rgba(0, 122, 255, 0.25)',
    bgClass: 'bg-[#000000]',
    cardBg: 'bg-[#1C1C1E]',
    borderAccent: 'border-[#007AFF]/30',
  },
];

export const applyThemeToDocument = (theme: AppTheme) => {
  const themeObj = THEME_PRESETS.find(t => t.id === theme) || THEME_PRESETS[0];
  const root = document.documentElement;

  root.style.setProperty('--accent-color', themeObj.accentHex);
  root.style.setProperty('--accent-glow', themeObj.glowColor);

  // Update meta theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', themeObj.accentHex);
  }
};
