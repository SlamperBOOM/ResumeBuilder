/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import axios from 'axios';
import windowStateKeeper from 'electron-window-state';
import MenuBuilder from './menu';
import { getFrontendPort, resolveHtmlPath } from './util';
import FrontendActionEnum from '../renderer/frontendAction/FrontendActionEnum';
import { appTitle, backendPort } from '../renderer/utils/consts';
import ActionResponseDTO from '../renderer/DTO/ActionResponseDTO';

const javaPath = path.join(process.resourcesPath, 'jre', 'bin', 'java.exe');
const jarPath = path.join(process.resourcesPath, 'backend', 'quarkus-run.jar');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
const backend: ChildProcessWithoutNullStreams | null = null;

function startBackend(): ChildProcessWithoutNullStreams | null {
  try {
    return spawn(
      javaPath,
      [
        '-Xms128m',
        '-Xmx512m',
        `-Dquarkus.http.port=${backendPort}`,
        `-Dquarkus.http.cors.origins=http://localhost:${getFrontendPort()}`,
        '-jar',
        jarPath,
      ],
      {
        stdio: 'pipe',
      },
    );
  } catch {
    return null;
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
    .catch(console.log);
};

const createWindow = async () => {
  console.log(javaPath);
  console.log(jarPath);
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // backend = startBackend();

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

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();
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

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

ipcMain.handle('open-file-dialog', async (event, resumeName: string) => {
  if (!mainWindow) {
    return undefined;
  }
  const result = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: `${resumeName}.pdf`,
  });

  return result;
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

app.on('before-quit', async (event) => {
  if (backend) {
    const result = (
      await axios
        .post(`http://localhost:${backendPort}/action/exit`)
        .catch((response) => {
          throw new Error(response.response.data);
        })
    ).data as ActionResponseDTO;
    if (result && result.frontend_action === FrontendActionEnum.CLOSE) {
      backend?.kill();
    } else {
      event.preventDefault();
      console.log('Not able to close backend');
    }
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
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
