import {
  Component,
  ElementRef,
  OnDestroy,
  SecurityContext,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import * as L from 'leaflet';
import 'leaflet-providers';
import { map } from 'rxjs';

import { MapObject, Scene, SceneAsset, SceneParagraph } from '../../core/models/story.models';
import { HomeDataService, MapTopic } from '../../core/services/home-data.service';
import { StoryDataService } from '../../core/services/story-data.service';

@Component({
  selector: 'app-scene-reader',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatChipsModule],
  templateUrl: './scene-reader.component.html',
  styleUrl: './scene-reader.component.scss',
})
export class SceneReaderComponent {
  @ViewChild('assetMapHost') private readonly assetMapHost?: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly homeData = inject(HomeDataService);
  private readonly storyData = inject(StoryDataService);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly sceneId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('sceneId'))),
    { initialValue: null },
  );

  protected readonly activeParagraphId = signal<string | null>(null);
  protected readonly activeAssetIndex = signal(0);
  protected readonly previewImageOpen = signal(false);
  protected readonly isMapFullscreen = signal(false);
  protected readonly currentScene = computed(() => this.storyData.getScene(this.sceneId()));
  protected readonly paragraphs = computed(() => this.currentScene()?.paragraphs ?? []);
  protected readonly sceneMapTopic = computed(
    () => this.homeData.topics.find((topic) => topic.sceneId === this.sceneId()) ?? null,
  );
  protected readonly relatedMapObjects = computed(() =>
    this.storyData.getRelatedMapObjects(this.sceneId()),
  );
  protected readonly activeParagraph = computed(() => {
    const paragraphs = this.paragraphs();
    const activeId = this.activeParagraphId();
    return paragraphs.find((paragraph) => paragraph.id === activeId) ?? paragraphs[0] ?? null;
  });
  protected readonly activeAssets = computed(() => this.activeParagraph()?.assets ?? []);
  protected readonly activeAsset = computed(() => {
    const assets = this.activeAssets();
    return assets[this.activeAssetIndex()] ?? assets[0] ?? null;
  });

  private assetMap?: L.Map;
  private assetLayers: L.Layer[] = [];
  private readonly fullscreenChangeHandler = () => {
    this.isMapFullscreen.set(Boolean(document.fullscreenElement));
    window.setTimeout(() => this.assetMap?.invalidateSize(), 150);
  };

  constructor() {
    effect(() => {
      const paragraphs = this.paragraphs();
      this.activeParagraphId.set(paragraphs[0]?.id ?? null);
      this.activeAssetIndex.set(0);
      this.previewImageOpen.set(false);
    });

    effect(() => {
      this.activeAsset();
      this.sceneMapTopic();
      this.relatedMapObjects();
      window.setTimeout(() => this.syncActiveAssetMap(), 0);
    });

    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    this.destroyAssetMap();
  }

  protected selectParagraph(paragraph: SceneParagraph): void {
    this.activeParagraphId.set(paragraph.id);
    this.activeAssetIndex.set(0);
    this.previewImageOpen.set(false);
  }

  protected previousAsset(): void {
    const assets = this.activeAssets();

    if (!assets.length) {
      return;
    }

    const nextIndex =
      this.activeAssetIndex() === 0 ? assets.length - 1 : this.activeAssetIndex() - 1;
    this.activeAssetIndex.set(nextIndex);
  }

  protected nextAsset(): void {
    const assets = this.activeAssets();

    if (!assets.length) {
      return;
    }

    const nextIndex =
      this.activeAssetIndex() === assets.length - 1 ? 0 : this.activeAssetIndex() + 1;
    this.activeAssetIndex.set(nextIndex);
  }

  protected selectAsset(index: number): void {
    this.activeAssetIndex.set(index);
    this.previewImageOpen.set(false);
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

  protected sanitizedParagraphText(paragraph: SceneParagraph): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, paragraph.text) ?? '';
  }

  protected openImagePreview(): void {
    if (this.activeAsset()?.type === 'image') {
      this.previewImageOpen.set(true);
    }
  }

  protected closeImagePreview(): void {
    this.previewImageOpen.set(false);
  }

  protected toggleMapFullscreen(): void {
    const container = this.assetMapHost?.nativeElement?.parentElement;

    if (!container) {
      return;
    }

    if (document.fullscreenElement === container) {
      void document.exitFullscreen();
      return;
    }

    void container.requestFullscreen();
  }

  protected mapHasObjects(): boolean {
    const asset = this.activeAsset();
    return this.getAssetMapObjects(asset).length > 0 || this.getAssetMapTopic(asset) !== null;
  }

  private syncActiveAssetMap(): void {
    const asset = this.activeAsset();
    const host = this.assetMapHost?.nativeElement;

    if (asset?.type !== 'map' || !host) {
      this.destroyAssetMap();
      return;
    }

    if (!this.assetMap) {
      this.assetMap = L.map(host, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer
        .provider('OpenTopoMap', {
          maxZoom: 17,
          maxNativeZoom: 17,
        })
        .addTo(this.assetMap);
    }

    this.renderAssetMap(asset);
    this.assetMap.invalidateSize();
  }

  private renderAssetMap(asset: SceneAsset): void {
    if (!this.assetMap) {
      return;
    }

    const mapInstance = this.assetMap;

    for (const layer of this.assetLayers) {
      layer.removeFrom(mapInstance);
    }

    this.assetLayers = [];
    const topic = this.getAssetMapTopic(asset);
    const mapObjects = this.getAssetMapObjects(asset);
    const bounds = L.latLngBounds([]);

    if (topic) {
      for (const polygonData of topic.polygons) {
        const polygon = L.polygon(polygonData.points, {
          color: '#124e78',
          weight: 2,
          fillColor: '#3ea6d8',
          fillOpacity: 0.34,
        })
          .addTo(mapInstance)
          .bindPopup(`<strong>${polygonData.name}</strong><br>${polygonData.description}`);

        bounds.extend(polygon.getBounds());
        this.assetLayers.push(polygon);
      }

      for (const polylineData of topic.polyline) {
        const polyline = L.polyline(polylineData.points, {
          color: '#124e78',
          weight: 3,
        })
          .addTo(mapInstance)
          .bindPopup(`<strong>${polylineData.name}</strong><br>${polylineData.description}`);

        bounds.extend(polyline.getBounds());
        this.assetLayers.push(polyline);
      }

      for (const labelData of topic.labels) {
        const marker = L.marker(labelData.position, {
          icon: L.divIcon({
            className: 'topic-label-marker',
            html: `<span class="topic-label-chip">${labelData.name}</span>`,
            iconSize: [0, 0],
          }),
        })
          .addTo(mapInstance)
          .bindPopup(`<strong>${labelData.name}</strong><br>${labelData.description}`);

        bounds.extend(marker.getLatLng());
        this.assetLayers.push(marker);
      }
    }

    const mapObjectLayers = mapObjects.flatMap((mapObject) => {
      const point = this.parseCoordinates(mapObject.coordinates);

      if (!point) {
        return [];
      }

      bounds.extend(point);

      return [
        L.marker(point)
          .addTo(mapInstance)
          .bindPopup(`<strong>${mapObject.name}</strong><br>${mapObject.detail}`),
      ];
    });

    this.assetLayers.push(...mapObjectLayers);

    if (bounds.isValid()) {
      mapInstance.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
      return;
    }

    const topicCenter = topic?.center;
    const topicZoom = topic?.zoom;

    if (topicCenter && topicZoom) {
      mapInstance.setView(topicCenter, topicZoom);
      return;
    }

    mapInstance.setView([31.963, 34.815], 8);
  }

  private getAssetMapObjects(asset: SceneAsset | null): MapObject[] {
    if (!asset || asset.type !== 'map') {
      return [];
    }

    if (asset.coordinates) {
      return [
        {
          id: asset.id,
          name: asset.locationLabel ?? asset.title,
          type: 'Map Location',
          period: this.currentScene()?.period ?? '',
          coordinates: asset.coordinates,
          detail: asset.description,
          sceneIds: [this.sceneId() ?? ''],
        },
      ];
    }

    const relatedObjects = this.relatedMapObjects();

    if (asset.locationLabel) {
      const normalizedLabel = asset.locationLabel.trim().toLowerCase();
      const matchingObjects = relatedObjects.filter((mapObject) =>
        mapObject.name.trim().toLowerCase().includes(normalizedLabel),
      );

      if (matchingObjects.length) {
        return matchingObjects;
      }
    }

    return relatedObjects;
  }

  private getAssetMapTopic(asset: SceneAsset | null): MapTopic | null {
    if (!asset || asset.type !== 'map') {
      return null;
    }

    if (asset.mapTopicId) {
      return this.homeData.topics.find((topic) => topic.id === asset.mapTopicId) ?? null;
    }

    return this.sceneMapTopic();
  }

  private parseCoordinates(value: string | undefined): L.LatLngExpression | null {
    if (!value) {
      return null;
    }

    const [lngText, latText] = value.split(',').map((entry) => entry.trim());
    const latitude = Number(latText);
    const longitude = Number(lngText);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return [latitude, longitude];
  }

  private destroyAssetMap(): void {
    this.assetLayers = [];
    this.assetMap?.remove();
    this.assetMap = undefined;
  }
}
