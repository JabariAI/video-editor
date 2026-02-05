export type TrackKind = 'video' | 'audio' | 'text';

export interface TimelineProject {
  id: string;
  name: string;
  fps: number;
  resolution: { width: number; height: number };
  durationMs: number;
  tracks: TimelineTrack[];
  assets: Record<string, AssetRef>;
  createdAt: string;
  updatedAt: string;
}

export interface AssetRef {
  id: string;
  path: string;
  proxyPath?: string;
  waveformPath?: string;
  thumbnailPath?: string;
  missing?: boolean;
  kind: 'video' | 'audio' | 'image';
}

export interface TimelineTrack {
  id: string;
  kind: TrackKind;
  name: string;
  locked: boolean;
  muted: boolean;
  clips: TimelineClip[];
}

export interface TimelineClip {
  id: string;
  assetId: string;
  startMs: number;
  durationMs: number;
  mediaInMs: number;
  mediaOutMs: number;
  speed: SpeedCurve;
  transitions?: Transition[];
  effects?: Effect[];
  keyframes?: KeyframeChannel[];
  text?: CaptionPayload;
}

export interface SpeedCurve {
  mode: 'constant' | 'ramp';
  value: number;
  points?: Array<{ timeMs: number; speed: number }>;
}

export interface Transition {
  type: 'crossfade' | 'dip_to_black';
  durationMs: number;
  side: 'in' | 'out';
}

export interface Effect {
  type: 'brightness' | 'contrast' | 'blur';
  value: number;
}

export interface KeyframeChannel {
  parameter: 'volume';
  points: Array<{ timeMs: number; value: number }>;
}

export interface CaptionPayload {
  text: string;
  style: {
    fontSize: number;
    color: string;
    bold: boolean;
    italic: boolean;
    background: string;
    alignment: 'left' | 'center' | 'right';
  };
}

export const createEmptyProject = (): TimelineProject => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Project',
    fps: 30,
    resolution: { width: 1920, height: 1080 },
    durationMs: 60_000,
    tracks: [
      { id: 'v1', kind: 'video', name: 'Video 1', locked: false, muted: false, clips: [] },
      { id: 'a1', kind: 'audio', name: 'Audio 1', locked: false, muted: false, clips: [] },
      { id: 't1', kind: 'text', name: 'Captions', locked: false, muted: false, clips: [] }
    ],
    assets: {},
    createdAt: now,
    updatedAt: now
  };
};
