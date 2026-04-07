import { Injectable, computed, signal } from '@angular/core';

import { MapObject, Scene } from '../models/story.models';

const INITIAL_SCENES: Scene[] = [
  {
    id: 'river-at-dawn',
    title: 'River at Dawn',
    period: '1846',
    tags: ['arrival', 'river', 'morning'],
    text:
      'The ferry scraped against the shallows as the first light reached the trading posts. Travelers stepped into the fog, carrying rumors about a missing survey team and a new road that would cut through the marsh.',
    paragraphs: [
      {
        id: 'landing',
        title: 'Landing at First Light',
        text:
          'The ferry reached the bank before sunrise. Terah’s caravan unloaded animals, water jars, and wrapped scrolls while scouts checked the reed line for a safe crossing.',
        assets: [
          {
            id: 'landing-map',
            type: 'map',
            title: 'Landing Map',
            description: 'Mock route sketch of the river landing and first camp perimeter.',
            locationLabel: 'River Approach'
          },
          {
            id: 'landing-image',
            type: 'image',
            title: 'Riverbank Mist',
            description: 'Early light over the muddy bank as the first travelers disembark.',
            imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      },
      {
        id: 'camp',
        title: 'Camp Beside the Reeds',
        text:
          'Once the animals were ashore, the group marked a temporary camp. Fires stayed low, and the elders spoke quietly about a western road that could shorten the journey.',
        assets: [
          {
            id: 'camp-map',
            type: 'map',
            title: 'Camp Layout',
            description: 'Mock map showing tent rows, supply animals, and the watch line.',
            locationLabel: 'Reed Marsh Camp'
          },
          {
            id: 'camp-image',
            type: 'image',
            title: 'Night Watch',
            description: 'A quiet camp scene with guards posted at the water edge.',
            imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      },
      {
        id: 'rumors',
        title: 'Rumors on the Road',
        text:
          'By dawn, merchants arriving from the south repeated stories about a missing survey team and an older route hidden in marsh records. The news shifts the direction of the next march.',
        assets: [
          {
            id: 'rumors-map',
            type: 'map',
            title: 'Survey Route',
            description: 'Mock route overlay connecting the marsh road with the traders’ approach.',
            locationLabel: 'Marsh Corridor'
          },
          {
            id: 'rumors-image',
            type: 'image',
            title: 'Roadside Exchange',
            description: 'Travelers gathering around a fire to compare reports and maps.',
            imageUrl: 'https://images.unsplash.com/photo-1517821365201-7734f463f7d2?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'market-of-glass',
    title: 'Market of Glass',
    period: '1847',
    tags: ['market', 'trade', 'city'],
    text:
      'In the noon heat, the glass arcade reflected every banner in fractured color. A coded note changed hands beside the clock tower, linking the merchants guild to the vanished survey maps.',
    paragraphs: [
      {
        id: 'arcade',
        title: 'Entering the Arcade',
        text:
          'The caravan enters a district where trade stalls and mirrors multiply every movement. It is the first place where route information becomes a commodity.',
        assets: [
          {
            id: 'arcade-map',
            type: 'map',
            title: 'Market Grid',
            description: 'Mock district map of the arcade gates and surrounding stalls.',
            locationLabel: 'Glass Arcade'
          },
          {
            id: 'arcade-image',
            type: 'image',
            title: 'Reflective Market',
            description: 'Color and movement bouncing through a dense covered market.',
            imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      },
      {
        id: 'tower',
        title: 'Note at the Clock Tower',
        text:
          'A coded note changes hands in the shade of the tower. The caravan learns that lost survey records may have been traded through the merchants guild.',
        assets: [
          {
            id: 'tower-map',
            type: 'map',
            title: 'Tower Vantage',
            description: 'Mock map of the tower sight lines and messenger paths.',
            locationLabel: 'Clock Tower'
          },
          {
            id: 'tower-image',
            type: 'image',
            title: 'Messenger Exchange',
            description: 'The handoff point where a sealed note alters the journey.',
            imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'citadel-after-rain',
    title: 'Citadel After Rain',
    period: '1848',
    tags: ['fortress', 'storm', 'politics'],
    text:
      'Rainwater streamed off the citadel walls while ministers argued over territory claims. Inside the archive hall, the old charts revealed that the marsh road was drawn decades earlier and quietly erased.',
    paragraphs: [
      {
        id: 'walls',
        title: 'Citadel Walls After Rain',
        text:
          'Rain leaves the stone dark and reflective. The approach to the archive is controlled, and every traveler is measured against the politics of the gate.',
        assets: [
          {
            id: 'walls-map',
            type: 'map',
            title: 'Citadel Gate Map',
            description: 'Mock access map covering the walls, checkpoints, and archive stairs.',
            locationLabel: 'Citadel Ridge'
          },
          {
            id: 'walls-image',
            type: 'image',
            title: 'Wet Stone Rampart',
            description: 'Rainwater running from the upper wall toward the gate court.',
            imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      },
      {
        id: 'archive',
        title: 'Charts in the Archive Hall',
        text:
          'Inside the hall, older charts expose that the marsh road had been recorded long before and later erased from public memory. The journey becomes part investigation, part inheritance.',
        assets: [
          {
            id: 'archive-map',
            type: 'map',
            title: 'Archive Chart',
            description: 'Mock annotated map copied from the sealed charts in the archive.',
            locationLabel: 'Archive Hall'
          },
          {
            id: 'archive-image',
            type: 'image',
            title: 'Chart Table',
            description: 'Copied route sheets spread over a table under dim archive light.',
            imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'
          }
        ]
      }
    ]
  }
];

const INITIAL_MAP_OBJECTS: MapObject[] = [
  {
    id: 'ferry-landing',
    name: 'Ferry Landing',
    type: 'Transit Point',
    period: '1846',
    coordinates: '34.815, 31.963',
    detail: 'Main arrival point for merchants, scouts, and river patrols.',
    sceneIds: ['river-at-dawn']
  },
  {
    id: 'survey-camp',
    name: 'Survey Camp',
    type: 'Field Site',
    period: '1846-1847',
    coordinates: '34.820, 31.955',
    detail: 'Temporary camp where the missing survey team last reported activity.',
    sceneIds: ['river-at-dawn', 'market-of-glass']
  },
  {
    id: 'clock-tower',
    name: 'Clock Tower',
    type: 'Landmark',
    period: '1847',
    coordinates: '34.801, 31.972',
    detail: 'Observation point overlooking the bazaar and the arcade entrances.',
    sceneIds: ['market-of-glass']
  },
  {
    id: 'archive-hall',
    name: 'Archive Hall',
    type: 'Institution',
    period: '1848',
    coordinates: '34.793, 31.981',
    detail: 'Repository of maps, decrees, and sealed correspondence inside the citadel.',
    sceneIds: ['citadel-after-rain']
  }
];

@Injectable({
  providedIn: 'root'
})
export class StoryDataService {
  private readonly scenesState = signal<Scene[]>(INITIAL_SCENES);
  private readonly mapObjectsState = signal<MapObject[]>(INITIAL_MAP_OBJECTS);

  readonly scenes = this.scenesState.asReadonly();
  readonly mapObjects = this.mapObjectsState.asReadonly();
  readonly sceneOptions = computed(() =>
    this.scenes()
      .map((scene) => ({ id: scene.id, title: scene.title }))
      .sort((left, right) => left.title.localeCompare(right.title))
  );

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
      paragraphs: scene.paragraphs ?? []
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
        sceneIds: mapObject.sceneIds.filter((id) => id !== sceneId)
      }))
    );
  }

  upsertMapObject(mapObject: MapObject): void {
    const normalized = {
      ...mapObject,
      id: mapObject.id.trim(),
      sceneIds: mapObject.sceneIds.map((sceneId) => sceneId.trim()).filter(Boolean)
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
      mapObjects.filter((mapObject) => mapObject.id !== mapObjectId)
    );
  }
}
