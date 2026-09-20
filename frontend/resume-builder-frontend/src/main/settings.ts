import Store from 'electron-store';
import { Settings, settingsDefaults } from '../renderer/utils/settingsDefaults';

// Frontend (non-BDUI) settings, stored in userData/settings.json.
const settings = new Store<Settings>({
  name: 'settings',
  defaults: settingsDefaults,
  schema: {
    themeMode: { type: 'string', enum: ['light', 'dark', 'system'] },
    window: {
      type: 'object',
      properties: {
        width: { type: 'integer', minimum: 1 },
        height: { type: 'integer', minimum: 1 },
        isMaximized: { type: 'boolean' },
      },
      required: ['width', 'height', 'isMaximized'],
    },
    editorLayout: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 2,
    },
    editPreviewScale: { type: 'number', exclusiveMinimum: 0 },
    editPreviewMode: { type: 'string' },
  },
});

export default settings;
