import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { app } from 'electron';
import { CacheService } from './preview/cacheService';

export class MediaService {
  readonly cache = new CacheService(path.join(app.getPath('userData'), 'cache'));

  async init(): Promise<void> {
    await this.cache.init();
  }

  runCacheJob(job: 'proxy' | 'waveform' | 'thumbnail', inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, '../workers/mediaWorker.js'), {
        workerData: { job, inputPath, outputPath }
      });
      worker.once('message', () => resolve());
      worker.once('error', reject);
      worker.once('exit', (code) => {
        if (code !== 0) reject(new Error(`Media worker exited with code ${code}`));
      });
    });
  }
}
