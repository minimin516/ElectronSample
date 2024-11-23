// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_CHANNELS } from '../common/ipcChannels';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage: (channel: string, data: [] | {}) => {
      if (Object.values(IPC_CHANNELS).includes(channel)) {
        ipcRenderer.send(channel, data);
      } else {
        console.warn(`Invalid channel: ${channel}`);
      }
    },
    on: (
      channel: string,
      callback: (event: Electron.IpcRendererEvent, args: [] | {}) => void,
    ) => {
      if (Object.values(IPC_CHANNELS).includes(channel)) {
        ipcRenderer.on(channel, callback);
      } else {
        console.warn(`Invalid channel: ${channel}`);
      }
    },
    once: (
      channel: string,
      callback: (event: Electron.IpcRendererEvent, args: [] | {}) => void,
    ) => {
      if (Object.values(IPC_CHANNELS).includes(channel)) {
        ipcRenderer.once(channel, callback);
      } else {
        console.warn(`Invalid channel: ${channel}`);
      }
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;
