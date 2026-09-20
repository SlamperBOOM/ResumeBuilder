// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { Settings } from '../renderer/utils/settingsDefaults';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

const exposedApi = {
  openSaveFileDialog: (resumeName: string) =>
    ipcRenderer.invoke('open-save-file-dialog', resumeName) as Promise<
      string | undefined
    >,
  openFileDialog: () =>
    ipcRenderer.invoke('open-file-dialog') as Promise<string | undefined>,
  openImageDialog: () => ipcRenderer.invoke('open-image-dialog'),
  getBackendPort: () =>
    ipcRenderer.invoke('get-backend-port') as Promise<number>,
  getAppVersion: () => ipcRenderer.invoke('get-app-version') as Promise<string>,
  openExternal: (url: string) =>
    ipcRenderer.invoke('open-external', url) as Promise<void>,
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<Settings>,
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) =>
    ipcRenderer.invoke('settings:set', key, value) as Promise<void>,
};

export type ElectronHandler = typeof exposedApi;

contextBridge.exposeInMainWorld('electron', exposedApi);
