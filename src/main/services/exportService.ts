import { spawn } from 'node:child_process';
import { JobQueue } from './jobs/JobQueue';
import { buildRenderCommand } from './ffmpeg/commandBuilder';
import { TimelineProject } from '@shared/timeline/schema';

export interface ExportRequest {
  jobId: string;
  ffmpegPath: string;
  project: TimelineProject;
  outputPath: string;
  presetId: 'mp4-1080p' | 'mp4-4k';
}

export class ExportService {
  constructor(private readonly queue: JobQueue) {}

  enqueue(request: ExportRequest): void {
    this.queue.enqueue({
      id: request.jobId,
      type: 'export',
      payload: request,
      run: async (payload, onProgress, signal) => {
        const command = buildRenderCommand(payload);
        await runProcess(command.executable, command.args, onProgress, signal);
      }
    });
  }
}

const runProcess = (command: string, args: string[], onProgress: (v: number) => void, signal: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    signal.addEventListener('abort', () => child.kill('SIGINT'));

    child.stderr.on('data', (buf) => {
      const line = String(buf);
      const match = /time=(\d+:\d+:\d+\.\d+)/.exec(line);
      if (match) {
        onProgress(Math.random());
      }
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with ${code}`));
    });
  });
};
