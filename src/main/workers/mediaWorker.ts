import { parentPort, workerData } from 'node:worker_threads';
import { writeFile } from 'node:fs/promises';

const main = async (): Promise<void> => {
  const payload = workerData as { job: string; inputPath: string; outputPath: string };
  if (payload.job === 'waveform') {
    await writeFile(payload.outputPath, JSON.stringify({ source: payload.inputPath, points: [] }), 'utf-8');
  } else {
    await writeFile(payload.outputPath, `generated from ${payload.inputPath}`, 'utf-8');
  }
  parentPort?.postMessage({ ok: true });
};

void main();
