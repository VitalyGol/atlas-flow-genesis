import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

import { MapObjectEditorComponent } from '../../components/map-object-editor/map-object-editor.component';
import { SceneEditorComponent } from '../../components/scene-editor/scene-editor.component';
import { MapObject, Scene } from '../../core/models/story.models';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { StoryDataService } from '../../core/services/story-data.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatTabsModule,
    MapObjectEditorComponent,
    SceneEditorComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private readonly auth = inject(MockAuthService);
  private readonly router = inject(Router);
  private readonly storyData = inject(StoryDataService);

  protected readonly scenes = this.storyData.scenes;
  protected readonly mapObjects = this.storyData.mapObjects;
  protected readonly selectedSceneId = signal<string | null>(null);
  protected readonly selectedMapObjectId = signal<string | null>(null);
  protected readonly selectedScene = computed(() => this.storyData.getScene(this.selectedSceneId()) ?? null);
  protected readonly selectedMapObject = computed(
    () => this.mapObjects().find((mapObject) => mapObject.id === this.selectedMapObjectId()) ?? null
  );

  protected saveScene(scene: Scene): void {
    this.storyData.upsertScene(scene);
    this.selectedSceneId.set(scene.id);
  }

  protected editScene(sceneId: string): void {
    this.selectedSceneId.set(sceneId);
  }

  protected deleteScene(sceneId: string): void {
    this.storyData.deleteScene(sceneId);
    if (this.selectedSceneId() === sceneId) {
      this.selectedSceneId.set(null);
    }
  }

  protected saveMapObject(mapObject: MapObject): void {
    this.storyData.upsertMapObject(mapObject);
    this.selectedMapObjectId.set(mapObject.id);
  }

  protected editMapObject(mapObjectId: string): void {
    this.selectedMapObjectId.set(mapObjectId);
  }

  protected deleteMapObject(mapObjectId: string): void {
    this.storyData.deleteMapObject(mapObjectId);
    if (this.selectedMapObjectId() === mapObjectId) {
      this.selectedMapObjectId.set(null);
    }
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
