import { Settings, settingsDefaults } from './settingsDefaults';
import logger from './logger';

// In-memory copy of the electron-store settings, so components read them
// synchronously. Loaded once in index.tsx before the first render.
let current: Settings = settingsDefaults;

export async function loadSettings(): Promise<void> {
  current = { ...settingsDefaults, ...(await window.electron.getSettings()) };
}

export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
  return current[key];
}

export function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K],
): void {
  current = { ...current, [key]: value };
  window.electron
    ?.setSetting(key, value)
    .catch((error) => logger.error(`Failed to save setting ${key}`, error));
}
