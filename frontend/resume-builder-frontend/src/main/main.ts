/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'node:path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import log from 'electron-log';
import axios from 'axios';
import windowStateKeeper from 'electron-window-state';
import { getFrontendPort, resolveHtmlPath } from './util';
import { startBackend, stopBackend, isBackendRunning } from './backend-manager';
import FrontendActionEnum from '../renderer/frontendAction/FrontendActionEnum';
import { appTitle, defaultBackendPort } from '../renderer/utils/consts';
import ActionResponseDTO from '../renderer/DTO/ActionResponseDTO';

let mainWindow: BrowserWindow | null = null;

let activeBackendPort: number | null = null;

log.initialize();
log.errorHandler.startCatching({ showDialog: false });

async function launchBackend(): Promise<void> {
  try {
    activeBackendPort = await startBackend({
      preferredPort: Number(defaultBackendPort),
      extraJvmArgs: [
        '-Xms128m',
        '-Xmx512m',
        `-Dquarkus.http.cors.origins=http://localhost:${getFrontendPort()}`,
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error('Failed to start backend', error);
    dialog.showErrorBox(
      appTitle,
      `Unable to start backend part of the app.\n\n${message}\n\nApplication will be closed.`,
    );
    app.quit();
    throw error;
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch((error: unknown) =>
      log.error('Failed to install devtools extensions', error),
    );
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const windowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  mainWindow = new BrowserWindow({
    show: false,
    minHeight: 600,
    minWidth: 800,
    width: windowState.width,
    height: windowState.height,
    icon: getAssetPath('icon.png'),
    title: appTitle,
    webPreferences: {
      // contextIsolation: true,
      // nodeIntegration: false,
      // sandbox: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  windowState.manage(mainWindow);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.removeMenu();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'about:blank') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          frame: true,
          fullscreenable: false,
          backgroundColor: 'white',
          webPreferences: {
            preload: 'my-child-window-preload-script.js',
          },
          title: appTitle,
        },
      };
    }
    return { action: 'deny' };
  });
};

ipcMain.handle('open-save-file-dialog', async (event, resumeName: string) => {
  if (!mainWindow) {
    return undefined;
  }
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `${resumeName}.pdf`,
  });

  return result.canceled ? undefined : result.filePath;
});

ipcMain.handle('open-file-dialog', async (event) => {
  if (!mainWindow) {
    return undefined;
  }
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
  });
  return result.canceled || result.filePaths.length === 0
    ? undefined
    : result.filePaths[0];
});

ipcMain.handle('open-image-dialog', async () => {
  if (!mainWindow) {
    return undefined;
  }
  const result = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg'],
      },
    ],
  });
  return result;
});

ipcMain.handle('get-backend-port', () => activeBackendPort);

ipcMain.handle('get-app-version', () => app.getVersion());

const allowedExternalHost = new Set(['github.com']);

ipcMain.handle('open-external', async (_event, url: string) => {
  const target = new URL(url);
  if (
    target.protocol !== 'https:' || !allowedExternalHost.has(target.hostname)
  ) {
    throw new Error(`Refused to open external link: ${url}`);
  }
  await shell.openExternal(target.toString());
});

app.on('before-quit', async (event) => {
  if (!isBackendRunning()) {
    return;
  }

  event.preventDefault();

  try {
    const result = (
      await axios
        .post(`http://localhost:${activeBackendPort}/action/exit`)
        .catch((error) => {
          const message = axios.isAxiosError(error)
            ? (error.response?.data ?? error.message)
            : String(error);
          throw new Error(message);
        })
    ).data as ActionResponseDTO;

    if (result?.frontend_action === FrontendActionEnum.CLOSE) {
      await stopBackend();
      app.exit();
    } else {
      log.warn('Not able to close backend gracefully');
    }
  } catch (error) {
    log.error('Failed to gracefully stop backend, killing it', error);
    await stopBackend();
    app.exit();
  }
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    await launchBackend();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch((error: unknown) => log.error('Failed during app startup', error));
