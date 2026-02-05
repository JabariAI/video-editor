import { BrowserWindow, dialog, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { JobQueue } from '../services/jobs/JobQueue';
import { ExportService } from '../services/exportService';
import { TimelineProject } from '@shared/timeline/schema';

interface Dependencies {
  queue: JobQueue;
  exportService: ExportService;
  autosavePath: string;
  recentsPath: string;
}

export const registerIpc = (mainWindow: any, deps: Dependencies): void => {
  ipcMain.handle('project:save', async (_event: unknown, project: TimelineProject, savePath?: string) => {
    const targetPath = savePath ?? path.join(process.cwd(), `${project.name}.vedit.json`);
    await fs.writeFile(targetPath, JSON.stringify(project, null, 2), 'utf-8');
    await appendRecent(deps.recentsPath, targetPath);
    return targetPath;
  });

  ipcMain.handle('project:load', async (_event: unknown, projectPath: string) => {
    const content = await fs.readFile(projectPath, 'utf-8');
    return JSON.parse(content) as TimelineProject;
  });

  ipcMain.handle('project:autosave', async (_event: unknown, project: TimelineProject) => {
    await fs.writeFile(deps.autosavePath, JSON.stringify(project), 'utf-8');
  });

  ipcMain.handle('project:recent', async () => {
    try {
      return JSON.parse(await fs.readFile(deps.recentsPath, 'utf-8')) as string[];
    } catch {
      return [];
    }
  });

  ipcMain.handle('media:import', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile', 'multiSelections'] });
    return result.filePaths;
  });

  ipcMain.handle('media:relink', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'] });
    return result.filePaths[0] ?? null;
  });

  ipcMain.handle('export:start', async (_event: unknown, request: { ffmpegPath: string; project: TimelineProject; outputPath: string; presetId: 'mp4-1080p' | 'mp4-4k' }) => {
    const id = crypto.randomUUID();
    deps.exportService.enqueue({ ...request, jobId: id });
    return id;
  });

  ipcMain.handle('export:cancel', async (_event: unknown, id: string) => {
    deps.queue.cancel(id);
  });

  deps.queue.on('progress', (event) => mainWindow.webContents.send('export:progress', event));
  deps.queue.on('status', (event) => mainWindow.webContents.send('export:progress', event));
};

const appendRecent = async (recentsPath: string, newPath: string): Promise<void> => {
  let recents: string[] = [];
  try {
    recents = JSON.parse(await fs.readFile(recentsPath, 'utf-8')) as string[];
  } catch {
    recents = [];
  }

  const deduped = [newPath, ...recents.filter((item) => item !== newPath)].slice(0, 10);
  await fs.writeFile(recentsPath, JSON.stringify(deduped), 'utf-8');
};
