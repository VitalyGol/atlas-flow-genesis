import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { map } from 'rxjs';

import { Scene, SceneAsset, SceneParagraph } from '../../core/models/story.models';
import { StoryDataService } from '../../core/services/story-data.service';

@Component({
  selector: 'app-scene-reader',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatChipsModule],
  templateUrl: './scene-reader.component.html',
  styleUrl: './scene-reader.component.scss'
})
export class SceneReaderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly storyData = inject(StoryDataService);

  private readonly sceneId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('sceneId'))),
    { initialValue: null }
  );

  protected readonly activeParagraphId = signal<string | null>(null);
  protected readonly activeAssetIndex = signal(0);
  protected readonly currentScene = computed(() => this.storyData.getScene(this.sceneId()));
  protected readonly paragraphs = computed(() => this.currentScene()?.paragraphs ?? []);
  protected readonly activeParagraph = computed(() => {
    const paragraphs = this.paragraphs();
    const activeId = this.activeParagraphId();
    return (
      paragraphs.find((paragraph) => paragraph.id === activeId) ??
      paragraphs[0] ??
      null
    );
  });
  protected readonly activeAssets = computed(() => this.activeParagraph()?.assets ?? []);
  protected readonly activeAsset = computed(() => {
    const assets = this.activeAssets();
    return assets[this.activeAssetIndex()] ?? assets[0] ?? null;
  });

  constructor() {
    effect(() => {
      const paragraphs = this.paragraphs();
      this.activeParagraphId.set(paragraphs[0]?.id ?? null);
      this.activeAssetIndex.set(0);
    });
  }

  protected selectParagraph(paragraph: SceneParagraph): void {
    this.activeParagraphId.set(paragraph.id);
    this.activeAssetIndex.set(0);
  }

  protected previousAsset(): void {
    const assets = this.activeAssets();

    if (!assets.length) {
      return;
    }

    const nextIndex = this.activeAssetIndex() === 0 ? assets.length - 1 : this.activeAssetIndex() - 1;
    this.activeAssetIndex.set(nextIndex);
  }

  protected nextAsset(): void {
    const assets = this.activeAssets();

    if (!assets.length) {
      return;
    }

    const nextIndex = this.activeAssetIndex() === assets.length - 1 ? 0 : this.activeAssetIndex() + 1;
    this.activeAssetIndex.set(nextIndex);
  }

  protected selectAsset(index: number): void {
    this.activeAssetIndex.set(index);
  }

  protected trackParagraph(index: number, paragraph: SceneParagraph): string {
    return paragraph.id;
  }

  protected trackAsset(index: number, asset: SceneAsset): string {
    return asset.id;
  }

  protected sceneLead(scene: Scene): string {
    return scene.paragraphs?.[0]?.text ?? scene.text;
  }
}
