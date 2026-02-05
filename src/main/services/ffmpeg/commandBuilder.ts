import { TimelineProject } from '@shared/timeline/schema';
import { EXPORT_PRESETS, ExportPreset } from './presets';

export interface RenderCommandRequest {
  ffmpegPath: string;
  project: TimelineProject;
  outputPath: string;
  presetId: ExportPreset['id'];
}

export interface RenderCommand {
  executable: string;
  args: string[];
  filtergraph: string;
}

export const buildRenderCommand = ({ ffmpegPath, project, outputPath, presetId }: RenderCommandRequest): RenderCommand => {
  const preset = EXPORT_PRESETS[presetId];
  const inputArgs = Object.values(project.assets).flatMap((asset) => ['-i', asset.path]);

  const sortedVideoClips = project.tracks
    .filter((track) => track.kind === 'video')
    .flatMap((track) => track.clips)
    .sort((a, b) => a.startMs - b.startMs);

  const videoChain = sortedVideoClips
    .map((clip, index) => {
      const brightness = clip.effects?.find((e) => e.type === 'brightness')?.value ?? 0;
      const contrast = clip.effects?.find((e) => e.type === 'contrast')?.value ?? 1;
      const blur = clip.effects?.find((e) => e.type === 'blur')?.value ?? 0;
      const speed = clip.speed.mode === 'constant' ? clip.speed.value : clip.speed.points?.[0]?.speed ?? clip.speed.value;
      return `[${index}:v]trim=start=${clip.mediaInMs / 1000}:end=${clip.mediaOutMs / 1000},setpts=PTS/${speed},eq=brightness=${brightness}:contrast=${contrast},boxblur=${blur}[v${index}]`;
    })
    .join(';');

  const concatInputs = sortedVideoClips.map((_, index) => `[v${index}]`).join('');
  const filtergraph = `${videoChain};${concatInputs}concat=n=${sortedVideoClips.length}:v=1:a=0[vo]`;

  const args = [
    ...inputArgs,
    '-filter_complex',
    filtergraph,
    '-map',
    '[vo]',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-b:v',
    preset.videoBitrate,
    '-vf',
    `scale=${preset.width}:${preset.height}`,
    '-c:a',
    'aac',
    '-b:a',
    preset.audioBitrate,
    '-movflags',
    '+faststart',
    '-y',
    outputPath
  ];

  return { executable: ffmpegPath, args, filtergraph };
};
