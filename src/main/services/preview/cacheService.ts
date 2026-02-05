import path from 'node:path';
import { promises as fs } from 'node:fs';

export class CacheService {
  constructor(private readonly cacheDir: string) {}

  async init(): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.mkdir(path.join(this.cacheDir, 'proxies'), { recursive: true });
    await fs.mkdir(path.join(this.cacheDir, 'thumbnails'), { recursive: true });
    await fs.mkdir(path.join(this.cacheDir, 'waveforms'), { recursive: true });
  }

  proxyPath(assetId: string): string {
    return path.join(this.cacheDir, 'proxies', `${assetId}.mp4`);
  }

  thumbnailPath(assetId: string): string {
    return path.join(this.cacheDir, 'thumbnails', `${assetId}.jpg`);
  }

  waveformPath(assetId: string): string {
    return path.join(this.cacheDir, 'waveforms', `${assetId}.json`);
  }
}
