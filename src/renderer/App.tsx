import { useEffect, useState } from 'react';
import { MediaBin } from './components/MediaBin';
import { TimelineView } from './components/TimelineView';
import { useTimelineStore } from './store/timelineStore';

declare global {
  interface Window {
    editorApi: import('@shared/types/ipc').EditorApi;
  }
}

export const App = () => {
  const { project, canRedo, canUndo, dispatch } = useTimelineStore();
  const [exportStatus, setExportStatus] = useState<string>('idle');

  useEffect(() => {
    const stop = window.editorApi.export.onProgress((event) => {
      setExportStatus(event.status ?? `${Math.round((event.progress ?? 0) * 100)}%`);
    });

    const interval = setInterval(() => {
      void window.editorApi.project.autosave(project);
    }, 15_000);

    return () => {
      stop();
      clearInterval(interval);
    };
  }, [project]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1>VideoEditor Pro</h1>
        <div className="actions">
          <button onClick={() => dispatch({ type: 'UNDO' })} disabled={!canUndo}>
            Undo
          </button>
          <button onClick={() => dispatch({ type: 'REDO' })} disabled={!canRedo}>
            Redo
          </button>
          <button
            onClick={async () => {
              await window.editorApi.export.start({
                ffmpegPath: 'ffmpeg',
                project,
                outputPath: './output.mp4',
                presetId: 'mp4-1080p'
              });
            }}
          >
            Export MP4
          </button>
          <span className="status">Export: {exportStatus}</span>
        </div>
      </header>
      <div className="workspace">
        <MediaBin project={project} onImport={() => void window.editorApi.media.import()} />
        <section className="panel preview-panel">
          <h3>GPU Preview Surface</h3>
          <canvas width={960} height={540} aria-label="Preview canvas" />
          <p>Preview renderer can bind WebGL2/WebGPU texture updates from proxy clips.</p>
        </section>
      </div>
      <TimelineView project={project} />
    </main>
  );
};
