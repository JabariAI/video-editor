import { TimelineProject } from '@shared/timeline/schema';

interface Props {
  project: TimelineProject;
}

export const TimelineView = ({ project }: Props) => {
  return (
    <section className="panel timeline-panel" aria-label="Timeline editor">
      <header className="timeline-header">
        <h3>Timeline</h3>
        <span>{Math.round(project.durationMs / 1000)}s</span>
      </header>
      <div className="timeline-grid" role="grid">
        {project.tracks.map((track) => (
          <div key={track.id} className="track-row">
            <aside>{track.name}</aside>
            <div className="track-lane">
              {track.clips.map((clip) => (
                <div key={clip.id} className="clip" style={{ left: `${clip.startMs / 100}px`, width: `${clip.durationMs / 100}px` }}>
                  {clip.id}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
