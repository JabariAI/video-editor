# VideoEditor Pro (Electron + React + TypeScript)

Production-oriented desktop video editor scaffold with deterministic timeline -> FFmpeg export pipeline.

## Architecture

- **Desktop runtime**: Electron (`src/main`)
- **Renderer**: React + TypeScript + Vite (`src/renderer`)
- **Core schema**: Shared timeline model (`src/shared/timeline/schema.ts`)
- **Editing state**: Reducer with undo/redo, split/trim/ripple (`src/shared/timeline/operations.ts`)
- **Media pipelines**:
  - Proxy/thumbnail/waveform cache service (`src/main/services/preview/cacheService.ts`)
  - Worker thread jobs (`src/main/workers/mediaWorker.ts`)
- **Export pipeline**:
  - Deterministic command builder (`src/main/services/ffmpeg/commandBuilder.ts`)
  - Presets 1080p + 4K (`src/main/services/ffmpeg/presets.ts`)
  - Background queue with cancel/progress (`src/main/services/jobs/JobQueue.ts`)
- **Security**: Context isolation + preload API + IPC boundaries.

## Delivered in requested phases

### Phase 1: Scaffold, UI shell, timeline schema
- Electron bootstrap, secure window config, preload bridge.
- React shell for media bin, preview surface, timeline pane.
- Internal timeline schema with tracks/clips/effects/keyframes/captions.

### Phase 2: Timeline operations + undo/redo
- Reducer actions: add, move, trim, split, ripple delete.
- Undo/redo history stack.

### Phase 3: Preview pipelines
- Cache service for proxy/thumb/waveform artifacts.
- Worker thread placeholder for heavy media tasks.
- Autosave loop and import/relink IPC surface.

### Phase 4: Export pipeline + presets + tests
- FFmpeg filtergraph command builder.
- MP4 presets (1080p, 4K).
- Background export queue and progress events.
- Unit tests for deterministic command construction.

## Setup

```bash
npm install
```

## Run in development

```bash
npm run dev
```

Starts Vite renderer + Electron main process.

## Validate

```bash
npm run typecheck
npm run test
npm run build
```

## Packaging

### macOS
```bash
npm run package:mac
```

### Windows
```bash
npm run package:win
```

## Project file model
- Saved as JSON (`*.vedit.json`) through `project:save` IPC.
- Autosaved file kept in Electron userData path.
- Recent projects list managed in userData path.

## Notes for production hardening
- Bind bundled FFmpeg binary path by platform.
- Expand audio mixing and volume keyframe interpolation in filtergraph.
- Replace progress parser with deterministic duration-based computation.
- Integrate WebGL/WebGPU compositor implementation.
- Complete media linking policy (copy/link) with checksums and repair workflow.
