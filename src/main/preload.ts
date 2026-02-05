import { contextBridge, ipcRenderer } from 'electron';
import type { EditorApi } from '@shared/types/ipc';

const api: EditorApi = {
  project: {
    save: (project, path) => ipcRenderer.invoke('project:save', project, path),
    load: (path) => ipcRenderer.invoke('project:load', path),
    autosave: (project) => ipcRenderer.invoke('project:autosave', project),
    recent: () => ipcRenderer.invoke('project:recent')
  },
  media: {
    import: () => ipcRenderer.invoke('media:import'),
    relink: (assetId) => ipcRenderer.invoke('media:relink', assetId)
  },
  export: {
    start: (request) => ipcRenderer.invoke('export:start', request),
    cancel: (jobId) => ipcRenderer.invoke('export:cancel', jobId),
    onProgress: (listener) => {
      const wrapped = (_: unknown, event: { id: string; progress: number; status?: string }) => listener(event);
      ipcRenderer.on('export:progress', wrapped);
      return () => ipcRenderer.removeListener('export:progress', wrapped);
    }
  }
};

contextBridge.exposeInMainWorld('editorApi', api);
