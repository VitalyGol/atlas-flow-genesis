# AtlasFlow Story Map MVP

Angular 21 story map app with static JSON content in `public/data` and a dev-only editor for safe local updates.

## Features

- Public homepage map powered by `home-topics.json`
- Public story reader powered by `story-data.json`
- Existing protected admin dashboard for in-memory edits
- Dev-only JSON editor with forms, validation, backups, and disk writes
- Production still reads JSON directly through `HttpClient`
- Standalone Angular components and Angular Material UI

## Data Files

Production and development both read:

- `public/data/home-topics.json`
- `public/data/story-data.json`

The dev editor writes backups into:

- `public/data/.backups/home-topics/`
- `public/data/.backups/story-data/`

## Routes

- `/` homepage map
- `/scenes/:sceneId` public story page
- `/admin/login` mock admin login
- `/admin` protected admin dashboard
- `/dev/editor` development-only JSON editor

`/dev/editor` is registered only in development and hidden in production.

## Dev Editor Architecture

- `src/environments/environment.ts` enables `editorEnabled`
- `src/environments/environment.prod.ts` disables the editor
- `src/app/app.routes.ts` only adds the editor route in development
- `src/app/core/guards/dev-only.guard.ts` blocks the route when the flag is off
- `src/app/pages/dev-json-editor/` hosts the editor page
- `src/app/components/home-topics-editor/` edits homepage topic data
- `src/app/components/story-data-editor/` edits scenes, paragraphs, assets, and map objects
- `src/app/core/services/editor-api.service.ts` talks to the local editor API
- `scripts/dev-editor-api.mjs` exposes the local save API
- `proxy.conf.json` proxies `/api/*` from Angular dev server to the local Node API

## Local Editor API

Available only in local development:

- `GET /api/editor/home-topics`
- `POST /api/editor/home-topics`
- `GET /api/editor/story-data`
- `POST /api/editor/story-data`

`POST` validates payloads, creates a backup, and writes formatted JSON back to disk.

## Setup

Install dependencies:

```bash
npm install
```

Run Angular dev server and local editor API together:

```bash
npm start
```

Open `http://localhost:4200/`.

Optional separate commands:

```bash
npm run start:client
npm run start:api
```

## Build

```bash
npm run build
```

Production output is written to `dist/atlasflow`.

Production build behavior:

- editor route is not included
- editor link is hidden
- editor API is not part of the build output
- site still reads `/data/*.json`

## Mock Auth

- Username: `admin`
- Password: `storymap`

The toolbar also exposes `Quick Admin Demo` for guard testing.

## Notes

- The existing admin dashboard is still separate from the file-based editor and only updates in-memory state.
- Public content loading remains compatible with the previous `HttpClient` JSON reads.
- Backups are ignored by Git through `.gitignore`.
