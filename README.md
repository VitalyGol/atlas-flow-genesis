# AtlasFlow Story Map MVP

An Angular 21 MVP for reading historical scenes alongside related map objects, with a simple protected admin area for in-memory content management.

## Features

- Public story reader page with scene title, text, tags, and period
- Right-side map object panel filtered to the current scene
- Protected admin login
- Admin dashboard for create, edit, and delete operations on:
  - scenes
  - map objects
- Angular routing with standalone components
- Mock in-memory data service for MVP development
- Responsive Angular Material UI

## Demo Routes

- `/scenes/river-at-dawn` public story reader
- `/scenes/:sceneId` public reader for any scene
- `/admin/login` admin login page
- `/admin` protected admin dashboard
- `/access-denied` fallback for blocked admin access

## Mock Auth

This MVP uses a hardcoded admin login:

- Username: `admin`
- Password: `storymap`

The header also includes a `Quick Admin Demo` button for fast guard testing.

## Setup

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm start
```

Open `http://localhost:4200/`.

## Build

```bash
npm run build
```

The production output is written to `dist/atlasflow`.

## Architecture

```text
src/app/
  components/
    map-object-editor/
    map-object-panel/
    scene-editor/
    scene-list/
  core/
    guards/
    models/
    services/
  layout/
    shell/
  pages/
    access-denied/
    admin-dashboard/
    admin-login/
    scene-reader/
```

## Notes

- All content is stored in memory through `StoryDataService`.
- Scene deletion automatically removes scene links from map objects.
- This project is intentionally backend-free for MVP speed.

## Publish To GitHub

1. Initialize Git if needed:

```bash
git init
git add .
git commit -m "Initial story map MVP"
```

2. Create a new GitHub repository and add the remote:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

3. Deploy with your preferred host:

- GitHub Pages
- Netlify
- Vercel

For GitHub Pages, build the app and publish the generated `dist/atlasflow/browser` output with your preferred deployment workflow.
