/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins..
 */
import path from 'path';
import electron, {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Display,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { getDisplay, resolveHtmlPath, settingNewBrowserWindow } from './util';
import { IPC_CHANNELS } from '../common/ipcChannels';
import Store from 'electron-store';
import { StoreType } from '../common/Type';
import protobuf from 'protobufjs';
import { protoContent } from '../common/messageProto';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let mainSideWindow: BrowserWindow | null = null;

const store = new Store<StoreType>() as Record<string, any>;

ipcMain.on(IPC_CHANNELS.GO_MAIN, async (event, arg) => {
  // 선택한 디스플레이의 bounds 정보
  const { bounds } = getDisplay();
  const windowWidth = 800;
  const windowHeight = 600;

  // 창을 화면 중앙에 배치하기 위한 좌표 계산
  const x = Math.round(bounds.x + (bounds.width - windowWidth) / 2);
  const y = Math.round(bounds.y + (bounds.height - windowHeight) / 2);

  let mainSideWindow = settingNewBrowserWindow({
    x,
    y,
    width: windowWidth,
    height: windowHeight,
    frame: false,
    fullscreen: false,
  });
  mainSideWindow.loadURL(resolveHtmlPath(`main.html`));
  mainSideWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      ipcMain.on(IPC_CHANNELS.GET_DATA, getDataFunction);
    }
  });

  mainSideWindow.on('close', () => {
    store.set('windowBounds', mainWindow?.getBounds());

    ipcMain.removeListener(IPC_CHANNELS.GET_DATA, getDataFunction);
    mainWindow = null;
  });
  mainSideWindow.on('closed', () => {
    // store.get('');
    console.log(store.get('windowBounds'));
    mainWindow = null;
  });
  console.log(IPC_CHANNELS.GO_MAIN, arg);
});

const getDataFunction = async (event: Electron.IpcMainEvent, arg: any) => {
  if (arg) {
    console.log(IPC_CHANNELS.GET_DATA, arg);

    const root = protobuf.parse(protoContent).root;
    const userDataRequest = root.lookupType('userDataReqRes');
    const message = userDataRequest.create(getUserData(arg.id));
    const buffer = userDataRequest.encode(message).finish();
    event.sender.send(IPC_CHANNELS.RESPONSE_DATA, buffer);
    return;
  }
  console.log('No Data');
};

function getUserData(userId: number) {
  // 예제 데이터
  const mockUsers = [
    { id: 123, name: 'MINKI', email: 'minki@example.com' },
    { id: 456, name: 'BOB', email: 'bob@example.com' },
  ];

  return (
    mockUsers.find((user) => user.id === userId) || { error: 'User not found' }
  );
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
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
  if (isDebug) {
    await installExtensions();
  }
  console.log(store);
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = settingNewBrowserWindow({
    ...getWindowBounds(),
    show: false,
    icon: getAssetPath('icon.png'),
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', () => {
    store.set('windowBounds', mainWindow?.getBounds());
    mainWindow = null;
  });
  mainWindow.on('closed', () => {
    // store.get('');
    console.log(store.get('windowBounds'));
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

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

function getWindowBounds() {
  return store.get('windowBounds', {
    x: 608,
    y: 266,
    width: 1024,
    height: 728,
  });
}
