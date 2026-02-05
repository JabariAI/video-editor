import { describe, expect, it } from 'vitest';
import { buildRenderCommand } from './commandBuilder';
import { TimelineProject } from '@shared/timeline/schema';

const sampleProject: TimelineProject = {
  id: 'p1',
  name: 'Test',
  fps: 30,
  resolution: { width: 1920, height: 1080 },
  durationMs: 10_000,
  createdAt: '',
  updatedAt: '',
  assets: {
    a: { id: 'a', kind: 'video', path: '/media/a.mp4' },
    b: { id: 'b', kind: 'video', path: '/media/b.mp4' }
  },
  tracks: [
    {
      id: 'v1',
      kind: 'video',
      name: 'Video',
      locked: false,
      muted: false,
      clips: [
        {
          id: 'c1',
          assetId: 'a',
          startMs: 0,
          durationMs: 3000,
          mediaInMs: 0,
          mediaOutMs: 3000,
          speed: { mode: 'constant', value: 1 },
          effects: [{ type: 'brightness', value: 0.1 }]
        },
        {
          id: 'c2',
          assetId: 'b',
          startMs: 3000,
          durationMs: 3000,
          mediaInMs: 1000,
          mediaOutMs: 4000,
          speed: { mode: 'constant', value: 1.25 }
        }
      ]
    }
  ]
};

describe('buildRenderCommand', () => {
  it('builds deterministic filtergraph and args', () => {
    const command = buildRenderCommand({
      ffmpegPath: '/bin/ffmpeg',
      project: sampleProject,
      outputPath: '/tmp/out.mp4',
      presetId: 'mp4-1080p'
    });

    expect(command.executable).toBe('/bin/ffmpeg');
    expect(command.filtergraph).toContain('concat=n=2:v=1:a=0[vo]');
    expect(command.args).toEqual(expect.arrayContaining(['-c:v', 'libx264', '-c:a', 'aac', '/tmp/out.mp4']));
  });
});
