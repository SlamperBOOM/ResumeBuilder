// Import-free on purpose: shared by the main process (electron-store defaults)
// and the renderer (fallback values before settings are loaded).

export type ThemeMode = 'light' | 'dark' | 'system';

export type Settings = {
  themeMode: ThemeMode;
  window: { width: number; height: number; isMaximized: boolean };
  editorLayout: string[];
  editorBlocksLayout: string[];
  editorRailPinned: boolean;
  editPreviewScale: number;
  editPreviewMode: string;
};

export const settingsDefaults: Settings = {
  themeMode: 'system',
  window: { width: 1200, height: 800, isMaximized: false },
  editorLayout: ['40', '60'],
  editorBlocksLayout: ['28', '72'],
  editorRailPinned: true,
  editPreviewScale: 0.5,
  editPreviewMode: 'full_height', // ResumePreviewScaleEnum.FULL_HEIGHT
};
