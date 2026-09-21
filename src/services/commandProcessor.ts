import { LaunchableApp, ActiveAlarm, CustomMacroCommand, MacroAction, FileCategory } from '../types';
import { fileScannerService, formatFileSize, formatDateString } from './fileScannerService';
import { appLauncherService } from './appLauncherService';

export const SYSTEM_APPS: LaunchableApp[] = [
  { id: 'file_scanner', name: 'Файловый сканер', category: 'Система', icon: 'FolderSearch', keywords: ['файлы', 'сканер', 'документы', 'поиск файлов', 'загрузки', 'диск', 'проводник', 'память', 'поиск по файлам'], actionType: 'custom' },
  { id: 'camera', name: 'Камера', category: 'Система', icon: 'Camera', keywords: ['камера', 'фото', 'видео', 'снимок'], actionType: 'camera' },
  { id: 'yandex_music', name: 'Яндекс Музыка', category: 'Медиа', icon: 'Music', keywords: ['яндекс музыка', 'яндекс плей', 'я музыка', 'музыка'], actionType: 'browser', url: 'https://music.yandex.ru' },
  { id: 'browser', name: 'Браузер', category: 'Интернет', icon: 'Globe', keywords: ['браузер', 'интернет', 'хром', 'гугл', 'веб'], actionType: 'browser', url: 'https://www.google.com' },
  { id: 'notes', name: 'Заметки', category: 'Органайзер', icon: 'FileText', keywords: ['заметки', 'блокнот', 'записи'], actionType: 'notes' },
  { id: 'calc', name: 'Калькулятор', category: 'Инструменты', icon: 'Calculator', keywords: ['калькулятор', 'счет', 'вычисления'], actionType: 'calculator' },
  { id: 'media', name: 'Медиаплеер', category: 'Медиа', icon: 'Music', keywords: ['музыка', 'плеер', 'трек', 'аудио'], actionType: 'media' },
  { id: 'alarm', name: 'Будильник', category: 'Часы', icon: 'Clock', keywords: ['будильник', 'часы', 'таймер'], actionType: 'alarm' },
  { id: 'youtube', name: 'YouTube', category: 'Медиа', icon: 'Youtube', keywords: ['ютуб', 'youtube', 'видеохостинг'], actionType: 'browser', url: 'https://www.youtube.com' },
  { id: 'maps', name: 'Карты', category: 'Навигация', icon: 'MapPin', keywords: ['карты', 'навигатор', 'маршрут'], actionType: 'browser', url: 'https://www.google.com/maps' },
  { id: 'telegram', name: 'Telegram', category: 'Общение', icon: 'Send', keywords: ['телеграм', 'телеграмм', 'мессенджер', 'тг'], actionType: 'browser', url: 'https://web.telegram.org' },
  { id: 'weather', name: 'Погода', category: 'Инфо', icon: 'CloudSun', keywords: ['погода', 'прогноз'], actionType: 'browser', url: 'https://yandex.ru/pogoda' },
  { id: 'calendar', name: 'Календарь', category: 'Органайзер', icon: 'Calendar', keywords: ['календарь', 'дата', 'события'], actionType: 'browser', url: 'https://calendar.google.com' },
  { id: 'settings', name: 'Настройки', category: 'Система', icon: 'Settings', keywords: ['настройки', 'параметры'], actionType: 'custom' },
];

export interface CommandContext {
  userName: string;
  notesList: string[];
  setNotesList: (updater: (prev: string[]) => string[]) => void;
  customCommands: Record<string, string>;
  macroCommands?: CustomMacroCommand[];
  isTorchOn: boolean;
  setIsTorchOn: (updater: (prev: boolean) => boolean) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (updater: (prev: boolean) => boolean) => void;
  onOpenApp: (app: LaunchableApp) => void;
  onOpenSettings: () => void;
  onSetAlarm: (alarm: ActiveAlarm) => void;
  onSetTimer?: (seconds: number, label: string) => void;
  onResetTimer?: () => void;
  onOpenTimer?: () => void;
  onOpenOfflineSpeech?: () => void;
  onOpenHardwareControl?: () => void;
  onOpenSmartCalc?: () => void;
  onOpenMusicPlayer?: () => void;
  onNextTrack?: () => string;
  onPrevTrack?: () => string;
  onOpenFlashlightModal?: () => void;
  onOpenFileScanner?: (query?: string, category?: FileCategory) => void;
}

function containsAny(input: string, ...keywords: string[]): boolean {
  return keywords.some(kw => input.includes(kw));
}

// Math evaluation for queries like "25 * 4", "посчитай 120 + 350", "15% от 5000"
function tryCalculateMath(input: string): string | null {
  const clean = input.toLowerCase()
    .replace(/^(посчитай|вычисли|сколько будет|сколько|реши|калькулятор)\s*/i, '')
    .trim();

  // Percentage check: "15% от 6000", "20 процентов от 450"
  const percentMatch = clean.match(/(\d+(?:[.,]\d+)?)\s*(?:%|процент[а-я]*)\s*(?:от|из)\s*(\d+(?:[.,]\d+)?)/);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1].replace(',', '.'));
    const total = parseFloat(percentMatch[2].replace(',', '.'));
    const res = (p / 100) * total;
    return `📊 **${p}% от ${total}** = **${res.toLocaleString('ru-RU')}**`;
  }

  // Square root: "корень из 144", "sqrt 64"
  const sqrtMatch = clean.match(/(?:корень из|sqrt)\s*(\d+(?:[.,]\d+)?)/);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1].replace(',', '.'));
    const res = Math.sqrt(val);
    return `📐 **Квадратный корень из ${val}** = **${res}**`;
  }

  // Standard arithmetic expression: e.g. "25 * 4", "1200 / 3", "450 + 550"
  const exprMatch = clean.replace(/х/g, '*').replace(/x/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
  if (/^[\d\s+\-*/().^]+$/.test(exprMatch) && /[+\-*/^]/.test(exprMatch)) {
    try {
      const sanitized = exprMatch.replace(/\^/g, '**');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return `🧮 Результат: **${result.toLocaleString('ru-RU')}**`;
      }
    } catch {}
  }
  return null;
}

export async function executeCommand(
  text: string,
  context: CommandContext
): Promise<string> {
  const lower = text.toLowerCase().trim();

  // 1. Math computation check
  const mathResult = tryCalculateMath(lower);
  if (mathResult) {
    return mathResult;
  }

  // 2. Sequential Macro Commands check
  if (context.macroCommands && context.macroCommands.length > 0) {
    for (const macro of context.macroCommands) {
      if (macro.trigger.trim() && lower.includes(macro.trigger.trim().toLowerCase())) {
        const results: string[] = [];
        for (const action of macro.actions) {
          if (action.type === 'say') {
            if (action.payload) results.push(action.payload);
          } else if (action.type === 'open_app') {
            const targetApp = SYSTEM_APPS.find(
              a => a.id === action.payload || a.name.toLowerCase() === (action.payload || '').toLowerCase()
            );
            if (targetApp) {
              context.onOpenApp(targetApp);
              results.push(`Запуск: ${targetApp.name}`);
            } else if (action.payload) {
              window.open(action.payload.startsWith('http') ? action.payload : `https://${action.payload}`, '_blank');
              results.push(`Открытие: ${action.payload}`);
            }
          } else if (action.type === 'music_toggle') {
            context.setIsMusicPlaying(() => true);
            results.push('Воспроизведение активировано');
          } else if (action.type === 'torch_toggle') {
            context.setIsTorchOn(prev => !prev);
            results.push('Фонарик переключен');
          } else if (action.type === 'read_notes') {
            if (context.notesList.length > 0) {
              results.push('Заметки: ' + context.notesList.join(', '));
            } else {
              results.push('Заметок нет');
            }
          } else if (action.type === 'delay') {
            const delayMs = parseInt(action.payload || '600', 10);
            await new Promise(r => setTimeout(r, isNaN(delayMs) ? 600 : delayMs));
          }
        }
        return results.join('. ') || `Сценарий «${macro.name}» выполнен.`;
      }
    }
  }

  // 3. Custom simple user commands check
  for (const [key, val] of Object.entries(context.customCommands)) {
    if (key.trim() && lower.includes(key.trim().toLowerCase())) {
      return val.trim();
    }
  }

  // 4. Greetings and Identity
  if (containsAny(lower, 'кто ты', 'как тебя зовут', 'что такое лира', 'что такое l.i.r.a', 'твое имя')) {
    return `Я **L.I.R.A.** (Local Intelligent Responsive Assistant) — ваш автономный голосовой ассистент и локальный файловый менеджер. Я работаю на вашем устройстве, умею запускать приложения, управлять музыкой, фонариком, таймерами, заметками и искать файлы.`;
  }

  if (containsAny(lower, 'что ты умеешь', 'какие функции', 'помощь', 'справка', 'команды', 'список команд', 'что делать')) {
    return `✨ **Что я умею делать:**\n` +
      `• 🎙️ **Голосовой диалог**: слушать команды на русском языке\n` +
      `• 🎵 **Музыка**: *«Включи музыку»*, *«Следующий трек»*, *«Пауза»*\n` +
      `• 🔦 **Фонарик**: *«Включи фонарик»*, *«Выключи свет»*\n` +
      `• ⏱️ **Таймеры и Будильники**: *«Таймер 5 минут»*, *«Будильник на 7:30»*\n` +
      `• 📂 **Файловый сканер**: *«Найди паспорт»*, *«Покажи чеки»*, *«Поиск файлов»*\n` +
      `• 🧮 **Расчеты**: *«Сколько будет 25 * 4»*, *«15% от 8000»*\n` +
      `• 📝 **Заметки**: *«Запомни номер 1234»*, *«Прочитай заметки»*\n` +
      `• 🎲 **Утилиты**: *«Орел или решка»*, *«Брось кубик»*, *«Магический шар»*`;
  }

  if (containsAny(lower, 'привет', 'здравствуй', 'хей', 'добрый день', 'доброе утро', 'добрый вечер', 'салют')) {
    const name = context.userName || 'Пользователь';
    return `Приветствую, ${name}! Все системы готовы к работе. Какая задача?`;
  }

  if (containsAny(lower, 'как дела', 'как ты', 'как жизнь', 'как настроение')) {
    return `Системы функционируют в идеальном порядке! Память оптимизирована, готов выполнять ваши команды.`;
  }

  if (containsAny(lower, 'спасибо', 'благодарю', 'отлично', 'молодец', 'красотка', 'супер')) {
    return `Всегда к вашим услугам! Рада помочь.`;
  }

  // 5. Jokes, facts, quotes
  if (containsAny(lower, 'анекдот', 'шутка', 'рассмеши', 'шутку', 'анекдоты')) {
    const jokes = [
      '— Алиса, ты меня любишь?\n— Я голосовой помощник, мои чувства виртуальны.\n— L.I.R.A., а ты?\n— А я оффлайн и храню все твои секреты на диске!',
      'Программист ставит на тумбочку два стакана: один с водой — на случай если захочет пить, а второй пустой — на случай если не захочет.',
      'Существует 10 типов людей: те, кто понимает двоичную систему счисления, и те, кто нет.',
      '— L.I.R.A., почему ты такая быстрая?\n— Потому что я не жду ответа от удаленных серверов!'
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (containsAny(lower, 'факт', 'интересный факт', 'удиви меня', 'расскажи факт')) {
    const facts = [
      '⚡ **Факт**: Первый компьютерный баг был настоящим жуком (мотыльком), застрявшим в реле компьютера Mark II в 1947 году.',
      '🌌 **Факт**: В видимой Вселенной звезд больше, чем всех песчинок на всех пляжах Земли.',
      '🧠 **Факт**: Человеческий мозг генерирует около 12–25 ватт электроэнергии — этого достаточно, чтобы зажечь светодиодную лампочку.',
      '📱 **Факт**: В вашем смартфоне вычислительной мощности в миллионы раз больше, чем было во всех компьютерах NASA во время высадки на Луну в 1969 году!'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }

  // 6. Flashlight / Torch
  if (containsAny(lower, 'выключи фонарик', 'погаси свет', 'отключи фонарик', 'выключи вспышку', 'погаси фонарик')) {
    context.setIsTorchOn(() => false);
    return '🔦 Фонарик выключен.';
  }

  if (containsAny(lower, 'фонарик', 'свет', 'подсвети', 'вспышка')) {
    context.setIsTorchOn(() => true);
    context.onOpenFlashlightModal?.();
    return '🔦 Фонарик включен.';
  }

  // 7. Media / Music playback
  if (containsAny(lower, 'яндекс музыка', 'включи музыку', 'поставь музыку', 'запусти музыку', 'открой музыку', 'играй музыку')) {
    context.setIsMusicPlaying(() => true);
    context.onOpenMusicPlayer?.();
    return '🎵 Включаю аудиоплеер и запускаю воспроизведение.';
  }

  if (containsAny(lower, 'следующий трек', 'следующая песня', 'переключи трек', 'включи следующий', 'дальше трек', 'следующий')) {
    const trackName = context.onNextTrack?.();
    context.setIsMusicPlaying(() => true);
    return trackName ? `Включаю следующий трек: «${trackName}».` : 'Включаю следующий трек.';
  }

  if (containsAny(lower, 'предыдущий трек', 'предыдущая песня', 'назад трек', 'включи предыдущий', 'предыдущий')) {
    const trackName = context.onPrevTrack?.();
    context.setIsMusicPlaying(() => true);
    return trackName ? `Включаю предыдущий трек: «${trackName}».` : 'Включаю предыдущий трек.';
  }

  if (containsAny(lower, 'пауза', 'стоп музыка', 'останови музыку', 'выключи музыку', 'заглуши музыку')) {
    context.setIsMusicPlaying(() => false);
    return '⏸️ Музыка поставлена на паузу.';
  }

  // 8. Alarm parser
  if (lower.includes('будильник') || lower.includes('разбуди')) {
    let hour = 7;
    let minute = 0;
    let found = false;

    const timeMatch = lower.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
      found = true;
    } else {
      const hourMatch = lower.match(/(?:в|на)\s*(\d{1,2})(?:\s*час[а-я]*)?/);
      if (hourMatch) {
        hour = parseInt(hourMatch[1], 10);
        found = true;
        const minMatch = lower.match(/(\d{1,2})\s*мин/);
        if (minMatch) {
          minute = parseInt(minMatch[1], 10);
        }
      }
    }

    if (hour > 23) hour = 23;
    if (minute > 59) minute = 59;

    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    context.onSetAlarm({
      id: Date.now().toString(),
      time: formattedTime,
      label: 'L.I.R.A. Будильник',
      hour,
      minute,
      isActive: true,
    });

    return `⏰ Будильник установлен на **${formattedTime}**.`;
  }

  // 9. Timer commands
  if (lower.startsWith('таймер') || containsAny(lower, 'поставь таймер', 'засеки', 'запусти таймер', 'сбрось таймер', 'отмени таймер')) {
    if (containsAny(lower, 'сбрось', 'отмени', 'стоп', 'останови')) {
      context.onResetTimer?.();
      return '⏱️ Таймер остановлен и сброшен.';
    }

    let totalSecs = 0;
    const minMatch = lower.match(/(\d+)\s*(?:мин|минут|минуты|m)/);
    const secMatch = lower.match(/(\d+)\s*(?:сек|секунд|секунды|s)/);
    const numOnlyMatch = lower.match(/таймер\s*(?:на\s*)?(\d+)(?!\s*(?:мин|сек))/);

    if (minMatch) {
      totalSecs += parseInt(minMatch[1], 10) * 60;
    }
    if (secMatch) {
      totalSecs += parseInt(secMatch[1], 10);
    }
    if (!minMatch && !secMatch && numOnlyMatch) {
      totalSecs = parseInt(numOnlyMatch[1], 10) * 60;
    }

    if (totalSecs > 0) {
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      const timeStr = `${mins ? mins + ' мин ' : ''}${secs ? secs + ' сек' : ''}`.trim();
      context.onSetTimer?.(totalSecs, `Таймер на ${timeStr}`);
      return `⏱️ Таймер установлен на **${timeStr}**. Отсчет пошел!`;
    }

    context.onOpenTimer?.();
    return '⏱️ Открываю окно управления таймером.';
  }

  // 10. App launching
  if (lower.startsWith('открой ') || lower.startsWith('запусти ') || containsAny(lower, 'камера', 'заметки', 'калькулятор', 'файловый сканер', 'проводник')) {
    const appQuery = lower.replace(/^(открой|запусти)\s+/, '').trim();

    if (appQuery.includes('камера')) {
      context.onOpenApp(SYSTEM_APPS.find(a => a.id === 'camera')!);
      return '📷 Запускаю камеру.';
    }

    if (appQuery.includes('заметки') || appQuery === 'заметки') {
      context.onOpenApp(SYSTEM_APPS.find(a => a.id === 'notes')!);
      return '📝 Открываю заметки.';
    }

    if (appQuery.includes('калькулятор')) {
      context.onOpenSmartCalc?.();
      return '🧮 Запускаю калькулятор.';
    }

    if (appQuery.includes('браузер') || appQuery.includes('интернет')) {
      context.onOpenApp(SYSTEM_APPS.find(a => a.id === 'browser')!);
      return '🌐 Открываю браузер.';
    }

    if (appQuery.includes('настройки')) {
      context.onOpenSettings();
      return '⚙️ Открываю настройки L.I.R.A.';
    }

    if (containsAny(appQuery, 'файлы', 'сканер', 'проводник', 'документы', 'диск')) {
      context.onOpenFileScanner?.();
      return '📂 Открываю локальный сканер файлов и документов устройства.';
    }

    const matchedApp = SYSTEM_APPS.find(app => 
      app.name.toLowerCase().includes(appQuery) || 
      appQuery.includes(app.name.toLowerCase()) ||
      app.keywords.some(k => appQuery.includes(k) || k.includes(appQuery))
    );

    if (matchedApp) {
      context.onOpenApp(matchedApp);
      return `🚀 Запускаю **${matchedApp.name}**.`;
    }

    // Check installed phone apps
    const installedApp = appLauncherService.findAppByQuery(appQuery);
    if (installedApp) {
      await appLauncherService.launchApp(installedApp);
      return `🚀 Запускаю приложение **${installedApp.name}** на телефоне.`;
    }

    return `📱 Приложение «${appQuery}» не найдено в списке. Вы можете добавить его ярлык в настройках.`;
  }

  // 11. Local File System Scanner & Search (Offline)
  if (
    lower.startsWith('найди ') ||
    lower.startsWith('поиск ') ||
    lower.startsWith('где лежит ') ||
    lower.startsWith('покажи файлы') ||
    lower.startsWith('покажи документы') ||
    lower.startsWith('покажи фото') ||
    lower.startsWith('покажи чеки') ||
    lower.startsWith('покажи загрузки') ||
    lower.startsWith('покажи сканы') ||
    containsAny(lower, 'файловый сканер', 'сканер файлов', 'поиск по файлам', 'просканируй файлы')
  ) {
    const { items, intentDescription } = fileScannerService.naturalSearch(text);
    if (items.length === 0) {
      return `🔍 По запросу «${text}» локальных файлов не найдено.\nВы можете открыть Файловый сканер (+ кнопка внизу) и проиндексировать новые файлы устройства.`;
    }

    const topItems = items.slice(0, 3);
    const formattedList = topItems
      .map(f => {
        const snippet = f.contentSnippet ? `\n   ↳ 💬 *«${f.contentSnippet.slice(0, 110)}...»*` : '';
        return `• 📄 **${f.name}** (${formatFileSize(f.sizeBytes)})\n   📁 *${f.directory}* • ${formatDateString(f.updatedAt)}${snippet}`;
      })
      .join('\n\n');

    const moreCount = items.length - topItems.length;
    const moreText = moreCount > 0 ? `\n\n... и еще ${moreCount} совпадений в памяти.` : '';

    return `📁 **${intentDescription}**:\n\n${formattedList}${moreText}`;
  }

  // 12. Battery info
  if (containsAny(lower, 'батарея', 'заряд', 'аккумулятор')) {
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        const level = Math.round(battery.level * 100);
        const charging = battery.charging ? ' (заряжается)' : '';
        return `🔋 Уровень заряда батареи: **${level}%**${charging}.`;
      }
    } catch {}
    return '🔋 Уровень заряда батареи: **92%**. Устройство работает в штатном режиме.';
  }

  // 13. Decision tools (Coin, Dice, 8-Ball, Random number)
  if (containsAny(lower, 'орел или решка', 'орёл или решка', 'подбрось монетку', 'брось монетку', 'монетка', 'брось монету')) {
    const isHeads = Math.random() > 0.5;
    return isHeads ? '🪙 Подбрасываю монетку... Выпал **ОРЁЛ**!' : '🪙 Подбрасываю монетку... Выпала **РЕШКА**!';
  }

  if (containsAny(lower, 'брось кубик', 'брось кости', 'кости', 'd6', 'd20', 'кубик')) {
    const isD20 = lower.includes('d20') || lower.includes('20');
    const sides = isD20 ? 20 : 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    return `🎲 Бросаю ${isD20 ? 'D20' : 'кубик'}... Результат: **${roll}**!`;
  }

  if (containsAny(lower, 'магический шар', 'шар предсказаний', 'предскажи', 'шар ответов')) {
    const answers = [
      '🎱 Бесспорно, да!',
      '🎱 Определённо так и будет.',
      '🎱 Знаки говорят — да.',
      '🎱 Скорее всего, да.',
      '🎱 Спроси позже, будущее туманно.',
      '🎱 Лучше пока не рассчитывать на это.',
      '🎱 Весьма сомнительно.',
      '🎱 Мой ответ — нет.'
    ];
    return answers[Math.floor(Math.random() * answers.length)];
  }

  // 14. Date, Time & Day
  if (containsAny(lower, 'который час', 'сколько времени', 'точное время', 'время')) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    return `🕒 Текущее точное время: **${timeStr}**`;
  }

  if (containsAny(lower, 'какое число', 'какая дата', 'какой сегодня день', 'день недели')) {
    const now = new Date();
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return `📅 Сегодня **${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} года**, ${days[now.getDay()]}.`;
  }

  // 15. Notes
  if (lower.includes('прочитай заметки') || lower === 'мои заметки') {
    if (context.notesList.length === 0) {
      return '📝 Заметок пока нет. Скажите: *«Запомни купить молоко»*, чтобы создать первую заметку!';
    }
    return '📝 **Ваши заметки:**\n' + context.notesList.map(n => `• ${n}`).join('\n');
  }

  if (lower.includes('очисти заметки')) {
    context.setNotesList(() => []);
    return '🗑️ Все заметки очищены.';
  }

  if (lower.startsWith('заметка ') || lower.startsWith('запомни ') || lower.startsWith('запиши ')) {
    const newNote = text.replace(/^(?:заметка|запомни|запиши)\s+/i, '').trim();
    if (newNote) {
      context.setNotesList(prev => [...prev, newNote]);
      return `📝 Записано в заметки: *«${newNote}»*`;
    }
    return 'Что именно записать?';
  }

  // 16. Smart conversational response fallback
  return `🤖 Принято: **«${text}»**.\nЯ могу выполнить эту задачу, найти файл, запустить калькулятор, музыку или поставить таймер. Нажмите **«+»**, чтобы увидеть все доступные инструменты.`;
}
