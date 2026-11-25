// The device's own choices for sounds. They live in this app's local storage, so each device keeps its own: a sound
// switched on a laptop does not switch on a phone.

export const SOUND_IDS = ['correct', 'wrong', 'coach'] as const;
export type SoundId = (typeof SOUND_IDS)[number];

export interface SoundPrefs {
  /** The master switch: when it is off, no sound plays. */
  enabled: boolean;
  /** From 0 to 100. */
  volume: number;
  items: Record<SoundId, boolean>;
}

const SOUND_KEY = 'botdanna.sounds';

const DEFAULT_SOUNDS: SoundPrefs = {
  enabled: true,
  volume: 60,
  items: { correct: true, wrong: true, coach: true },
};

function readJson<T>(key: string): Partial<T> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return value && typeof value === 'object' ? (value as Partial<T>) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked. The choice then lasts until the app closes.
  }
}

export function readSoundPrefs(): SoundPrefs {
  const saved = readJson<SoundPrefs>(SOUND_KEY);
  const volume = typeof saved?.volume === 'number' && Number.isFinite(saved.volume) ? saved.volume : DEFAULT_SOUNDS.volume;
  return {
    enabled: typeof saved?.enabled === 'boolean' ? saved.enabled : DEFAULT_SOUNDS.enabled,
    volume: Math.min(100, Math.max(0, Math.round(volume))),
    items: { ...DEFAULT_SOUNDS.items, ...(saved?.items ?? {}) },
  };
}

export function writeSoundPrefs(prefs: SoundPrefs): void {
  writeJson(SOUND_KEY, prefs);
}

// Where the tabs sit: under the screen, as they always have, or in the title bar, next to the wordmark. A choice of this
// device, kept under its own key in this app's local storage. It is never sent to the account.
export const TAB_LAYOUTS = ['bottom', 'top'] as const;
export type TabLayout = (typeof TAB_LAYOUTS)[number];

const TAB_LAYOUT_KEY = 'botdanna.tabs';

/** The tab layout of this device. Anything other than "top", and no storage at all, keeps the tabs at the bottom. */
export function readTabLayout(): TabLayout {
  try {
    return window.localStorage.getItem(TAB_LAYOUT_KEY) === 'top' ? 'top' : 'bottom';
  } catch {
    return 'bottom';
  }
}

export function writeTabLayout(layout: TabLayout): void {
  try {
    window.localStorage.setItem(TAB_LAYOUT_KEY, layout);
  } catch {
    // Storage can be blocked. The choice then lasts until the app closes.
  }
}
