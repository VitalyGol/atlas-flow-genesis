import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { StoryDataDocument } from '../models/editor.models';
import { MapObject, Scene } from '../models/story.models';

@Injectable({
  providedIn: 'root',
})
export class StoryDataService {
  private readonly http = inject(HttpClient);
  private readonly scenesState = signal<Scene[]>([]);
  private readonly mapObjectsState = signal<MapObject[]>([]);

  readonly scenes = this.scenesState.asReadonly();
  readonly mapObjects = this.mapObjectsState.asReadonly();
  readonly sceneOptions = computed(() =>
    this.scenes()
      .map((scene) => ({ id: scene.id, title: scene.title }))
      .sort((left, right) => left.title.localeCompare(right.title)),
  );

  constructor() {
    this.reload();
  }

  reload(): void {
    this.http.get<StoryDataDocument>('/data/story-data.json').subscribe({
      next: (document) => this.setDocument(document),
      error: () => this.setDocument({ scenes: [], mapObjects: [] }),
    });
  }

  setDocument(document: StoryDataDocument): void {
    this.scenesState.set(document.scenes);
    this.mapObjectsState.set(document.mapObjects);
  }

  getDocument(): StoryDataDocument {
    return {
      scenes: this.scenes(),
      mapObjects: this.mapObjects(),
    };
  }

  getScene(id: string | null): Scene | undefined {
    return this.scenes().find((scene) => scene.id === id);
  }

  getRelatedMapObjects(sceneId: string | null): MapObject[] {
    if (!sceneId) {
      return [];
    }

    return this.mapObjects().filter((mapObject) => mapObject.sceneIds.includes(sceneId));
  }

  upsertScene(scene: Scene): void {
    const normalized = {
      ...scene,
      id: scene.id.trim(),
      tags: scene.tags.map((tag) => tag.trim()).filter(Boolean),
      paragraphs: scene.paragraphs ?? [],
    };

    this.scenesState.update((scenes) => {
      const index = scenes.findIndex((entry) => entry.id === normalized.id);
      return index === -1
        ? [...scenes, normalized]
        : scenes.map((entry) => (entry.id === normalized.id ? normalized : entry));
    });
  }

  deleteScene(sceneId: string): void {
    this.scenesState.update((scenes) => scenes.filter((scene) => scene.id !== sceneId));
    this.mapObjectsState.update((mapObjects) =>
      mapObjects.map((mapObject) => ({
        ...mapObject,
        sceneIds: mapObject.sceneIds.filter((id) => id !== sceneId),
      })),
    );
  }

  upsertMapObject(mapObject: MapObject): void {
    const normalized = {
      ...mapObject,
      id: mapObject.id.trim(),
      sceneIds: mapObject.sceneIds.map((sceneId) => sceneId.trim()).filter(Boolean),
    };

    this.mapObjectsState.update((mapObjects) => {
      const index = mapObjects.findIndex((entry) => entry.id === normalized.id);
      return index === -1
        ? [...mapObjects, normalized]
        : mapObjects.map((entry) => (entry.id === normalized.id ? normalized : entry));
    });
  }

  deleteMapObject(mapObjectId: string): void {
    this.mapObjectsState.update((mapObjects) =>
      mapObjects.filter((mapObject) => mapObject.id !== mapObjectId),
    );
  }
}
