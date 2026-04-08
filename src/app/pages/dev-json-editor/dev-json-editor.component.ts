import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

import { HomeTopicsEditorComponent } from '../../components/home-topics-editor/home-topics-editor.component';
import { StoryDataEditorComponent } from '../../components/story-data-editor/story-data-editor.component';
import { EditorSaveResponse, StoryDataDocument } from '../../core/models/editor.models';
import { MapTopic } from '../../core/models/home.models';
import { EditorApiService } from '../../core/services/editor-api.service';
import { HomeDataService } from '../../core/services/home-data.service';
import { StoryDataService } from '../../core/services/story-data.service';

@Component({
  selector: 'app-dev-json-editor',
  imports: [MatCardModule, MatTabsModule, HomeTopicsEditorComponent, StoryDataEditorComponent],
  templateUrl: './dev-json-editor.component.html',
  styleUrl: './dev-json-editor.component.scss',
})
export class DevJsonEditorComponent {
  private readonly editorApi = inject(EditorApiService);
  private readonly homeData = inject(HomeDataService);
  private readonly storyData = inject(StoryDataService);

  protected readonly homeTopics = signal<MapTopic[]>([]);
  protected readonly storyDocument = signal<StoryDataDocument>({ scenes: [], mapObjects: [] });
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly saveMessage = signal('');

  constructor() {
    void this.loadDocuments();
  }

  protected async saveHomeTopics(topics: MapTopic[]): Promise<void> {
    await this.save(async () => {
      const response = await firstValueFrom(this.editorApi.saveHomeTopics(topics));
      this.homeTopics.set(topics);
      this.homeData.setTopics(topics);
      return response;
    });
  }

  protected async saveStoryDocument(document: StoryDataDocument): Promise<void> {
    await this.save(async () => {
      const response = await firstValueFrom(this.editorApi.saveStoryData(document));
      this.storyDocument.set(document);
      this.storyData.setDocument(document);
      return response;
    });
  }

  protected async reload(): Promise<void> {
    await this.loadDocuments();
  }

  private async loadDocuments(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const [homeTopics, storyDocument] = await Promise.all([
        firstValueFrom(this.editorApi.getHomeTopics()),
        firstValueFrom(this.editorApi.getStoryData()),
      ]);

      this.homeTopics.set(homeTopics);
      this.storyDocument.set(storyDocument);
    } catch {
      this.errorMessage.set(
        'Dev editor API is unavailable. Start the local editor server and Angular dev server together.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  private async save(action: () => Promise<EditorSaveResponse>): Promise<void> {
    this.saving.set(true);
    this.errorMessage.set('');
    this.saveMessage.set('');

    try {
      const response = await action();
      this.saveMessage.set(
        `Saved ${response.entity} at ${response.savedAt}. Backup: ${response.backupPath}`,
      );
    } catch {
      this.errorMessage.set(
        'Save failed. Check validation errors and confirm the dev editor API is running.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
