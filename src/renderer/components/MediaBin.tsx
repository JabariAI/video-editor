import { TimelineProject } from '@shared/timeline/schema';

interface Props {
  project: TimelineProject;
  onImport: () => void;
}

export const MediaBin = ({ project, onImport }: Props) => {
  return (
    <section className="panel media-panel" aria-label="Media bin">
      <header>
        <h3>Media Bin</h3>
        <button onClick={onImport}>Import</button>
      </header>
      <div className="media-grid">
        {Object.values(project.assets).map((asset) => (
          <article key={asset.id} className="media-card" draggable>
            <div className="thumb">{asset.thumbnailPath ? '🖼️' : '🎬'}</div>
            <p>{asset.path.split('/').at(-1)}</p>
            {asset.missing ? <small className="missing">Missing - Relink Required</small> : null}
          </article>
        ))}
      </div>
    </section>
  );
};
