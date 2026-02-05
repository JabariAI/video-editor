import { TimelineProject } from '@shared/timeline/schema';

export interface EditorApi {
  project: {
    save: (project: TimelineProject, path?: string) => Promise<string>;
    load: (path: string) => Promise<TimelineProject>;
    autosave: (project: TimelineProject) => Promise<void>;
    recent: () => Promise<string[]>;
  };
  media: {
    import: () => Promise<string[]>;
    relink: (assetId: string) => Promise<string | null>;
  };
  export: {
    start: (request: {
      ffmpegPath: string;
      project: TimelineProject;
      outputPath: string;
      presetId: 'mp4-1080p' | 'mp4-4k';
    }) => Promise<string>;
    cancel: (jobId: string) => Promise<void>;
    onProgress: (listener: (event: { id: string; progress: number; status?: string }) => void) => () => void;
  };
}
