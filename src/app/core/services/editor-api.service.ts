import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EditorEntity, EditorSaveResponse, StoryDataDocument } from '../models/editor.models';
import { MapTopic } from '../models/home.models';

@Injectable({
  providedIn: 'root',
})
export class EditorApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.editorApiBaseUrl;

  getHomeTopics(): Observable<MapTopic[]> {
    return this.http.get<MapTopic[]>(`${this.baseUrl}/home-topics`);
  }

  saveHomeTopics(topics: MapTopic[]): Observable<EditorSaveResponse> {
    return this.saveEntity('home-topics', topics);
  }

  getStoryData(): Observable<StoryDataDocument> {
    return this.http.get<StoryDataDocument>(`${this.baseUrl}/story-data`);
  }

  saveStoryData(document: StoryDataDocument): Observable<EditorSaveResponse> {
    return this.saveEntity('story-data', document);
  }

  private saveEntity<TPayload>(
    entity: EditorEntity,
    payload: TPayload,
  ): Observable<EditorSaveResponse> {
    return this.http.post<EditorSaveResponse>(`${this.baseUrl}/${entity}`, payload);
  }
}
