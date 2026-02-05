import { TimelineClip, TimelineProject } from './schema';

export interface TimelineState {
  past: TimelineProject[];
  present: TimelineProject;
  future: TimelineProject[];
}

export type TimelineAction =
  | { type: 'ADD_CLIP'; trackId: string; clip: TimelineClip }
  | { type: 'TRIM_CLIP'; trackId: string; clipId: string; inMs?: number; outMs?: number }
  | { type: 'SPLIT_CLIP'; trackId: string; clipId: string; atMs: number }
  | { type: 'RIPPLE_DELETE'; trackId: string; clipId: string }
  | { type: 'MOVE_CLIP'; trackId: string; clipId: string; toMs: number }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export const reduceTimeline = (state: TimelineState, action: TimelineAction): TimelineState => {
  if (action.type === 'UNDO') {
    if (!state.past.length) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future]
    };
  }

  if (action.type === 'REDO') {
    if (!state.future.length) return state;
    const [next, ...rest] = state.future;
    return {
      past: [...state.past, state.present],
      present: next,
      future: rest
    };
  }

  const updated = applyEdit(state.present, action);
  return {
    past: [...state.past, state.present],
    present: { ...updated, updatedAt: new Date().toISOString() },
    future: []
  };
};

const applyEdit = (project: TimelineProject, action: Exclude<TimelineAction, { type: 'UNDO' } | { type: 'REDO' }>): TimelineProject => {
  const tracks = project.tracks.map((track) => {
    if (track.id !== action.trackId || track.locked) return track;

    switch (action.type) {
      case 'ADD_CLIP':
        return { ...track, clips: [...track.clips, action.clip].sort((a, b) => a.startMs - b.startMs) };
      case 'MOVE_CLIP':
        return {
          ...track,
          clips: track.clips.map((clip) => (clip.id === action.clipId ? { ...clip, startMs: action.toMs } : clip))
        };
      case 'TRIM_CLIP':
        return {
          ...track,
          clips: track.clips.map((clip) => {
            if (clip.id !== action.clipId) return clip;
            const mediaInMs = action.inMs ?? clip.mediaInMs;
            const mediaOutMs = action.outMs ?? clip.mediaOutMs;
            return { ...clip, mediaInMs, mediaOutMs, durationMs: mediaOutMs - mediaInMs };
          })
        };
      case 'SPLIT_CLIP': {
        const target = track.clips.find((clip) => clip.id === action.clipId);
        if (!target) return track;
        const splitOffset = action.atMs - target.startMs;
        if (splitOffset <= 0 || splitOffset >= target.durationMs) return track;
        const left = { ...target, id: `${target.id}-a`, durationMs: splitOffset, mediaOutMs: target.mediaInMs + splitOffset };
        const right = {
          ...target,
          id: `${target.id}-b`,
          startMs: action.atMs,
          durationMs: target.durationMs - splitOffset,
          mediaInMs: target.mediaInMs + splitOffset
        };
        return { ...track, clips: track.clips.flatMap((clip) => (clip.id === action.clipId ? [left, right] : [clip])) };
      }
      case 'RIPPLE_DELETE': {
        const deleting = track.clips.find((clip) => clip.id === action.clipId);
        if (!deleting) return track;
        return {
          ...track,
          clips: track.clips
            .filter((clip) => clip.id !== action.clipId)
            .map((clip) => (clip.startMs > deleting.startMs ? { ...clip, startMs: clip.startMs - deleting.durationMs } : clip))
        };
      }
      default:
        return track;
    }
  });

  return { ...project, tracks };
};
