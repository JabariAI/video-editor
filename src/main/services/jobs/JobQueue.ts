import { EventEmitter } from 'node:events';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface QueueJob<TPayload> {
  id: string;
  type: string;
  payload: TPayload;
  run: (payload: TPayload, onProgress: (value: number) => void, signal: AbortSignal) => Promise<void>;
}

export class JobQueue extends EventEmitter {
  private queue: QueueJob<unknown>[] = [];
  private active = new Map<string, AbortController>();

  enqueue<T>(job: QueueJob<T>): void {
    this.queue.push(job as QueueJob<unknown>);
    this.emit('status', { id: job.id, status: 'queued' as JobStatus });
    void this.drain();
  }

  cancel(jobId: string): void {
    const active = this.active.get(jobId);
    if (active) {
      active.abort();
      this.emit('status', { id: jobId, status: 'cancelled' as JobStatus });
      return;
    }
    this.queue = this.queue.filter((job) => job.id !== jobId);
    this.emit('status', { id: jobId, status: 'cancelled' as JobStatus });
  }

  private draining = false;

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;

    while (this.queue.length) {
      const job = this.queue.shift();
      if (!job) continue;
      const controller = new AbortController();
      this.active.set(job.id, controller);
      this.emit('status', { id: job.id, status: 'running' as JobStatus });

      try {
        await job.run(job.payload, (progress) => this.emit('progress', { id: job.id, progress }), controller.signal);
        if (!controller.signal.aborted) this.emit('status', { id: job.id, status: 'completed' as JobStatus });
      } catch (error) {
        if (!controller.signal.aborted) {
          this.emit('status', { id: job.id, status: 'failed' as JobStatus, error: (error as Error).message });
        }
      } finally {
        this.active.delete(job.id);
      }
    }

    this.draining = false;
  }
}
