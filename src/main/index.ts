import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { registerIpc } from './ipc/registerIpc';
import { JobQueue } from './services/jobs/JobQueue';
import { ExportService } from './services/exportService';
import { MediaService } from './services/mediaService';

const queue = new JobQueue();
const exportService = new ExportService(queue);
const mediaService = new MediaService();

const createWindow = async (): Promise<void> => {
  await mediaService.init();
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  registerIpc(mainWindow, {
    queue,
    exportService,
    autosavePath: path.join(app.getPath('userData'), 'autosave.vedit.json'),
    recentsPath: path.join(app.getPath('userData'), 'recent-projects.json')
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
};

app.whenReady().then(() => {
  void createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
