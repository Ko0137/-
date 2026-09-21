// App Icons Definition & Dynamic Browser Favicon Switcher

export interface AppIconDefinition {
  id: string;
  name: string;
  subtitle: string;
  accentColor: string;
  gradient: string;
  svg: string;
}

export const APP_ICONS: AppIconDefinition[] = [
  {
    id: 'emerald_core',
    name: 'Изумрудный L.I.R.A.',
    subtitle: 'Фирменный неоновый изумруд',
    accentColor: '#00E676',
    gradient: 'from-[#00E676] via-[#00B0FF] to-[#121212]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <radialGradient id="em_bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#1F3D2F"/>
          <stop offset="100%" stop-color="#0A0F0D"/>
        </radialGradient>
        <linearGradient id="em_glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00FF88"/>
          <stop offset="100%" stop-color="#00E676"/>
        </linearGradient>
        <linearGradient id="em_ring" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00B0FF"/>
          <stop offset="100%" stop-color="#00E676"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#em_bg)"/>
      <circle cx="64" cy="64" r="46" fill="none" stroke="url(#em_ring)" stroke-width="4" opacity="0.85"/>
      <circle cx="64" cy="64" r="34" fill="none" stroke="url(#em_glow)" stroke-width="3" opacity="0.6"/>
      <path d="M44 40 L44 88 L78 88" fill="none" stroke="url(#em_glow)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="84" cy="46" r="8" fill="#00FF88"/>
      <circle cx="64" cy="64" r="5" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'liquid_glass_ios',
    name: 'Liquid Glass (iOS)',
    subtitle: 'Стеклянный блик Cupertino',
    accentColor: '#007AFF',
    gradient: 'from-[#007AFF] via-[#5856D6] to-[#000000]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <linearGradient id="ios_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1C1C1E"/>
          <stop offset="100%" stop-color="#000000"/>
        </linearGradient>
        <linearGradient id="ios_glass" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4"/>
          <stop offset="50%" stop-color="#007AFF" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#5856D6" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="ios_specular" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#ios_bg)"/>
      <rect x="2" y="2" width="124" height="60" rx="26" fill="url(#ios_specular)"/>
      <circle cx="64" cy="64" r="42" fill="url(#ios_glass)"/>
      <circle cx="64" cy="64" r="41" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.5"/>
      <path d="M46 44 L46 84 L76 84" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="82" cy="48" r="6.5" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'cyber_sapphire',
    name: 'Cyber Sapphire',
    subtitle: 'Неоновый синий киберпанк',
    accentColor: '#00F0FF',
    gradient: 'from-[#00F0FF] via-[#0051FF] to-[#0A0E2A]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <radialGradient id="cy_bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#0F1B3B"/>
          <stop offset="100%" stop-color="#050814"/>
        </radialGradient>
        <linearGradient id="cy_neon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F0FF"/>
          <stop offset="100%" stop-color="#7000FF"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#cy_bg)"/>
      <polygon points="64,18 106,42 106,86 64,110 22,86 22,42" fill="none" stroke="url(#cy_neon)" stroke-width="3.5"/>
      <circle cx="64" cy="64" r="22" fill="none" stroke="#00F0FF" stroke-width="2.5" stroke-dasharray="8 4"/>
      <path d="M48 46 L48 82 L76 82" fill="none" stroke="#00F0FF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="80" cy="50" r="5" fill="#FF007F"/>
    </svg>`,
  },
  {
    id: 'royal_amethyst',
    name: 'Royal Amethyst',
    subtitle: 'Космический аметист & маджента',
    accentColor: '#E040FB',
    gradient: 'from-[#E040FB] via-[#7C4DFF] to-[#12002B]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <radialGradient id="am_bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#2D0B4E"/>
          <stop offset="100%" stop-color="#0B0214"/>
        </radialGradient>
        <linearGradient id="am_glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF4081"/>
          <stop offset="100%" stop-color="#7C4DFF"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#am_bg)"/>
      <circle cx="64" cy="64" r="44" fill="none" stroke="url(#am_glow)" stroke-width="4"/>
      <path d="M44 42 L44 86 L78 86" fill="none" stroke="url(#am_glow)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="82" cy="46" r="7" fill="#E040FB"/>
      <circle cx="64" cy="64" r="14" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7"/>
    </svg>`,
  },
  {
    id: 'solar_amber',
    name: 'Solar Amber',
    subtitle: 'Теплый золотой закат',
    accentColor: '#FFAB00',
    gradient: 'from-[#FFAB00] via-[#FF6D00] to-[#261300]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <radialGradient id="sol_bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#3D2005"/>
          <stop offset="100%" stop-color="#120800"/>
        </radialGradient>
        <linearGradient id="sol_glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD600"/>
          <stop offset="100%" stop-color="#FF6D00"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#sol_bg)"/>
      <circle cx="64" cy="64" r="44" fill="none" stroke="url(#sol_glow)" stroke-width="4"/>
      <path d="M44 42 L44 86 L78 86" fill="none" stroke="url(#sol_glow)" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="82" cy="46" r="7" fill="#FFD600"/>
      <circle cx="64" cy="64" r="6" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'obsidian_stealth',
    name: 'Obsidian Stealth',
    subtitle: 'Премиум монохромный титан',
    accentColor: '#E0E0E0',
    gradient: 'from-[#FFFFFF] via-[#888888] to-[#121212]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <linearGradient id="obs_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#242426"/>
          <stop offset="100%" stop-color="#0A0A0A"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#obs_bg)"/>
      <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.2"/>
      <circle cx="64" cy="64" r="42" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-opacity="0.8"/>
      <path d="M45 43 L45 85 L77 85" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="81" cy="47" r="6" fill="#FFFFFF"/>
    </svg>`,
  },
  {
    id: 'porcelain_mint',
    name: 'Porcelain Mint',
    subtitle: 'Светлый чистый жемчуг',
    accentColor: '#00C853',
    gradient: 'from-[#00C853] via-[#80E27E] to-[#F5F5F5]',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <linearGradient id="por_bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#E8ECE9"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#por_bg)"/>
      <circle cx="64" cy="64" r="44" fill="none" stroke="#00C853" stroke-width="4"/>
      <path d="M44 42 L44 86 L78 86" fill="none" stroke="#1E4D38" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="82" cy="46" r="7" fill="#00C853"/>
      <circle cx="64" cy="64" r="5" fill="#00E676"/>
    </svg>`,
  },
];

const STORAGE_KEY_ICON = 'lira_selected_app_icon_v2';

export const getSavedAppIconId = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ICON);
    if (saved && APP_ICONS.some(i => i.id === saved)) {
      return saved;
    }
  } catch {}
  return 'emerald_core';
};

export const applyAppIcon = (iconId: string): void => {
  try {
    const iconDef = APP_ICONS.find(i => i.id === iconId) || APP_ICONS[0];
    localStorage.setItem(STORAGE_KEY_ICON, iconDef.id);

    // Encode SVG to Data URI
    const svgClean = iconDef.svg.replace(/\n/g, '').replace(/\s+/g, ' ');
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgClean)}`;

    // Update Favicon Link
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/svg+xml';
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = dataUri;

    // Update Apple Touch Icon
    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.getElementsByTagName('head')[0].appendChild(appleLink);
    }
    appleLink.href = dataUri;
  } catch (err) {
    console.warn('Failed to update app favicon:', err);
  }
};
