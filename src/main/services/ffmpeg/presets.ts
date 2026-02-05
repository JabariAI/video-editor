export interface ExportPreset {
  id: 'mp4-1080p' | 'mp4-4k';
  label: string;
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
}

export const EXPORT_PRESETS: Record<ExportPreset['id'], ExportPreset> = {
  'mp4-1080p': {
    id: 'mp4-1080p',
    label: 'MP4 1080p (H.264 + AAC)',
    width: 1920,
    height: 1080,
    videoBitrate: '8M',
    audioBitrate: '192k'
  },
  'mp4-4k': {
    id: 'mp4-4k',
    label: 'MP4 4K (H.264 + AAC)',
    width: 3840,
    height: 2160,
    videoBitrate: '40M',
    audioBitrate: '320k'
  }
};
