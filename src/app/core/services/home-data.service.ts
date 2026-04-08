import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { MapTopic } from '../models/home.models';

@Injectable({
  providedIn: 'root',
})
export class HomeDataService {
  private readonly http = inject(HttpClient);
  private readonly topicsState = signal<MapTopic[]>([]);

  readonly topics = this.topicsState.asReadonly();

  constructor() {
    this.reload();
  }

  reload(): void {
    this.http.get<MapTopic[]>('/data/home-topics.json').subscribe({
      next: (topics) => this.topicsState.set(topics),
      error: () => this.topicsState.set([]),
    });
  }

  setTopics(topics: MapTopic[]): void {
    this.topicsState.set(topics);
  }
}
