import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { IndexedFileItem, FileCategory, FileFilterOptions } from '../types';

const STORAGE_KEY = 'lira_indexed_files_v1';

export const INITIAL_FILES: IndexedFileItem[] = [];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDateString(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

class FileScannerService {
  private files: IndexedFileItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') {
      this.files = [...INITIAL_FILES];
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.files = parsed;
          return;
        }
      }
    } catch {}
    this.files = [...INITIAL_FILES];
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.files));
      } catch {}
    }
  }

  getAllFiles(): IndexedFileItem[] {
    return this.files;
  }

  addFile(file: IndexedFileItem) {
    this.files = [file, ...this.files.filter(f => f.id !== file.id)];
    this.saveToStorage();
  }

  deleteFile(id: string) {
    this.files = this.files.filter(f => f.id !== id);
    this.saveToStorage();
  }

  toggleStar(id: string) {
    this.files = this.files.map(f => (f.id === id ? { ...f, isStarred: !f.isStarred } : f));
    this.saveToStorage();
  }

  resetToDefaults() {
    this.files = [...INITIAL_FILES];
    this.saveToStorage();
  }

  /**
   * Scan actual files from user device via File API or drag & drop.
   * Completely local in-browser memory without network transmission!
   */
  async scanDeviceFiles(fileList: FileList | File[]): Promise<IndexedFileItem[]> {
    const newItems: IndexedFileItem[] = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      let category: FileCategory = 'other';
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (['pdf', 'docx', 'doc', 'txt', 'rtf', 'xlsx', 'xls', 'pptx', 'ppt', 'md', 'epub'].includes(ext)) {
        category = 'document';
      } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'heic', 'bmp'].includes(ext)) {
        category = 'image';
      } else if (['zip', 'rar', '7z', 'tar', 'gz', 'apk', 'exe', 'msi', 'dmg', 'iso'].includes(ext)) {
        category = 'download';
      } else if (['mp3', 'wav', 'm4a', 'flac', 'aac', 'ogg'].includes(ext)) {
        category = 'audio';
      } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'sql', 'sh'].includes(ext)) {
        category = 'code';
      }

      let snippet = `Файл ${file.name} (${formatFileSize(file.size)}). Тип: ${file.type || ext}.`;
      let previewUrl: string | undefined = undefined;

      // Extract text snippet from text-based files
      if (
        category === 'code' ||
        ext === 'txt' ||
        ext === 'md' ||
        ext === 'json' ||
        file.type.startsWith('text/')
      ) {
        try {
          const text = await file.text();
          snippet = text.slice(0, 400).trim() || snippet;
        } catch {}
      } else if (category === 'image') {
        try {
          previewUrl = URL.createObjectURL(file);
          snippet = `Изображение ${file.name}, размер ${formatFileSize(file.size)}.`;
        } catch {}
      }

      const item: IndexedFileItem = {
        id: 'scanned-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        name: file.name,
        extension: ext,
        category,
        directory: (file as any).webkitRelativePath
          ? (file as any).webkitRelativePath.split('/').slice(0, -1).join('/') + '/'
          : 'Storage/Scanned/',
        sizeBytes: file.size,
        updatedAt: new Date(file.lastModified || Date.now()).toISOString(),
        contentSnippet: snippet,
        tags: [ext, category, 'локальный скан'],
        previewDataUrl: previewUrl,
        isStarred: false,
        mimeType: file.type,
        isUserScanned: true,
      };

      newItems.push(item);
    }

    this.files = [...newItems, ...this.files];
    this.saveToStorage();
    return newItems;
  }

  /**
   * Search files using query & multi-filter logic.
   */
  searchFiles(options: FileFilterOptions): IndexedFileItem[] {
    const {
      query = '',
      category = 'all',
      dateRange = 'all',
      sizeRange = 'all',
      sortBy = 'date',
      sortDirection = 'desc',
    } = options;

    const lowerQuery = query.toLowerCase().trim();
    const now = new Date().getTime();

    const filtered = this.files.filter(item => {
      // 1. Category check
      if (category !== 'all' && item.category !== category) {
        return false;
      }

      // 2. Query check (name, extension, directory, tags, contentSnippet)
      if (lowerQuery) {
        const matchesName = item.name.toLowerCase().includes(lowerQuery);
        const matchesExt = item.extension.toLowerCase().includes(lowerQuery);
        const matchesDir = item.directory.toLowerCase().includes(lowerQuery);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(lowerQuery));
        const matchesContent = item.contentSnippet.toLowerCase().includes(lowerQuery);

        if (!matchesName && !matchesExt && !matchesDir && !matchesTags && !matchesContent) {
          return false;
        }
      }

      // 3. Date range check
      if (dateRange !== 'all') {
        const fileTime = new Date(item.updatedAt).getTime();
        const diffMs = now - fileTime;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateRange === 'today' && diffDays > 1.2) return false;
        if (dateRange === 'week' && diffDays > 7.5) return false;
        if (dateRange === 'month' && diffDays > 31) return false;
        if (dateRange === 'year' && diffDays > 366) return false;
      }

      // 4. Size range check
      if (sizeRange !== 'all') {
        if (sizeRange === 'small' && item.sizeBytes >= 1024 * 1024) return false; // < 1MB
        if (
          sizeRange === 'medium' &&
          (item.sizeBytes < 1024 * 1024 || item.sizeBytes > 50 * 1024 * 1024)
        )
          return false; // 1-50MB
        if (sizeRange === 'large' && item.sizeBytes <= 50 * 1024 * 1024) return false; // > 50MB
      }

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'date') {
        comp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'size') {
        comp = b.sizeBytes - a.sizeBytes;
      } else if (sortBy === 'name') {
        comp = a.name.localeCompare(b.name);
      }
      return sortDirection === 'asc' ? -comp : comp;
    });

    return filtered;
  }

  /**
   * Natural Language Query Parser for LIRA voice commands
   */
  naturalSearch(input: string): { items: IndexedFileItem[]; intentDescription: string } {
    const lower = input.toLowerCase().trim();

    let category: FileCategory = 'all';
    let dateRange: 'all' | 'today' | 'week' | 'month' | 'year' = 'all';
    let cleanQuery = lower
      .replace(
        /^(найди|поиск|где лежит|покажи|открой|найди файл|найди документ|найди фото|найди чек|найди чек за|найди сканы|поищи)\s+/i,
        ''
      )
      .trim();

    if (lower.includes('документ') || lower.includes('доки') || lower.includes('пдф') || lower.includes('pdf') || lower.includes('ворд') || lower.includes('word')) {
      category = 'document';
      cleanQuery = cleanQuery.replace(/(документ|доки|пдф|pdf|ворд|word|документы)\s*/gi, '').trim();
    } else if (lower.includes('фото') || lower.includes('картинк') || lower.includes('изображен') || lower.includes('скриншот') || lower.includes('снимок')) {
      category = 'image';
      cleanQuery = cleanQuery.replace(/(фото|картинки|картинку|изображение|скриншот|снимок|фотографии)\s*/gi, '').trim();
    } else if (lower.includes('загрузк') || lower.includes('скачанн') || lower.includes('downloads') || lower.includes('архив')) {
      category = 'download';
      cleanQuery = cleanQuery.replace(/(загрузки|скачанные файлы|скачанные|загруженное|downloads|архивы)\s*/gi, '').trim();
    } else if (lower.includes('аудио') || lower.includes('музык') || lower.includes('диктофон') || lower.includes('запись')) {
      category = 'audio';
      cleanQuery = cleanQuery.replace(/(аудио|музыка|диктофон|запись|трек)\s*/gi, '').trim();
    }

    if (lower.includes('сегодня')) {
      dateRange = 'today';
      cleanQuery = cleanQuery.replace(/сегодня\s*/gi, '').trim();
    } else if (lower.includes('за эту неделю') || lower.includes('за неделю') || lower.includes('на этой неделе')) {
      dateRange = 'week';
      cleanQuery = cleanQuery.replace(/(за эту неделю|за неделю|на этой неделе)\s*/gi, '').trim();
    } else if (lower.includes('за месяц') || lower.includes('в этом месяце')) {
      dateRange = 'month';
      cleanQuery = cleanQuery.replace(/(за месяц|в этом месяце)\s*/gi, '').trim();
    }

    const items = this.searchFiles({
      query: cleanQuery,
      category,
      dateRange,
      sortBy: 'date',
    });

    let desc = `Найдено файлов: ${items.length}`;
    if (cleanQuery) desc += ` по запросу «${cleanQuery}»`;
    if (category !== 'all') desc += ` [Категория: ${category}]`;
    if (dateRange !== 'all') desc += ` [Период: ${dateRange}]`;

    return { items, intentDescription: desc };
  }

  /**
   * Storage usage breakdown
   */
  public async scanDeviceStorageNative(): Promise<number> {
    if (!Capacitor.isNativePlatform()) return 0;
    let addedCount = 0;
    try {
      const directories = [
        { dir: Directory.Documents, cat: 'document' as FileCategory, path: 'Документы' },
        { dir: Directory.Data, cat: 'other' as FileCategory, path: 'Данные' },
        { dir: Directory.External, cat: 'download' as FileCategory, path: 'Внешняя память' },
      ];

      for (const d of directories) {
        try {
          const res = await Filesystem.readdir({ path: '', directory: d.dir });
          for (const item of res.files) {
            const fileName = typeof item === 'string' ? item : item.name;
            if (!fileName) continue;
            
            const ext = fileName.split('.').pop()?.toLowerCase() || '';
            let category: FileCategory = d.cat;
            if (['pdf', 'doc', 'docx', 'txt', 'xlsx'].includes(ext)) category = 'document';
            if (['jpg', 'png', 'gif', 'webp', 'jpeg'].includes(ext)) category = 'image';
            if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) category = 'audio';
            if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) category = 'archive';

            const scannedItem: IndexedFileItem = {
              id: 'native-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
              name: fileName,
              extension: ext,
              category,
              directory: `/${d.path}/`,
              sizeBytes: typeof item === 'object' && (item as any).size ? (item as any).size : 1024 * 50,
              updatedAt: new Date().toISOString(),
              contentSnippet: `Файл ${fileName} из директории ${d.path}`,
              tags: [ext, category, 'локальный скан'],
              isStarred: false,
              isUserScanned: true,
            };
            this.files.push(scannedItem);
            addedCount++;
          }
        } catch {}
      }
    } catch (err) {
      console.error('Native scan error:', err);
    }
    return addedCount;
  }

  public getStorageStats() {
    let totalBytes = 0;
    const categoryStats: Record<string, { count: number; bytes: number }> = {
      document: { count: 0, bytes: 0 },
      image: { count: 0, bytes: 0 },
      download: { count: 0, bytes: 0 },
      audio: { count: 0, bytes: 0 },
      archive: { count: 0, bytes: 0 },
      code: { count: 0, bytes: 0 },
      other: { count: 0, bytes: 0 },
    };

    for (const f of this.files) {
      totalBytes += f.sizeBytes;
      if (categoryStats[f.category]) {
        categoryStats[f.category].count += 1;
        categoryStats[f.category].bytes += f.sizeBytes;
      }
    }

    return {
      totalFiles: this.files.length,
      totalBytes,
      formattedTotal: formatFileSize(totalBytes),
      categoryStats,
    };
  }
}

export const fileScannerService = new FileScannerService();
