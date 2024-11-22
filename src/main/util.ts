/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import electron, { BrowserWindow, Display, app } from 'electron';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function getDisplay(): Display {
  const displays: Display[] = electron.screen
    .getAllDisplays()
    .sort(
      (a: Display, b: Display) =>
        a.bounds.x + a.bounds.y - b.bounds.x - b.bounds.y,
    );
  const main = displays.find(
    (display: Display) => display.bounds.x === 0 && display.bounds.y === 0,
  );
  if (!main) {
    throw new Error('Primary display not found');
  }
  return main;
}

export function settingNewBrowserWindow(
  options?: Electron.BrowserWindowConstructorOptions,
) {
  return new BrowserWindow({
    ...options,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
}
