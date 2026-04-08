import { Injectable, computed, signal } from '@angular/core';

import { MapObject, Scene } from '../models/story.models';

const INITIAL_SCENES: Scene[] = [
  {
    id: 'river-at-dawn',
    title: 'Родословие Тераха и путь из Ура',
    period: '1846',
    tags: ['arrival', 'river', 'morning'],
    text: 'Семья Тераха: рождение Аврама, смерть Арана, браки, бесплодие Сарай и переселение из Ура в Харран',
    paragraphs: [
      {
        id: 'genesis11_1',
        path: 'Берешит 11:26',
        title: ' И исполнилось Тераху семьдесят лет, и родил он Аврама, Нахора и Харана',
        text:
          `У Тераха рождаются три сына. Порядок их перечисления в тексте не обязательно отражает старшинство: в библейской традиции на первое место нередко выносится персонаж, играющий ключевую роль в дальнейшем повествовании.
Указание возраста Тераха, по-видимому, означает не момент рождения всех трёх сыновей, а возраст, с которого у него начали рождаться дети.
Особого внимания заслуживает имя Аврама. В семитской традиции оно обычно объясняется как сочетание элементов ab («отец») и ram («возвышенный»), что позволяет переводить его как «возвышенный отец».
В библейской традиции имена нередко осмысляются в свете дальнейшей судьбы персонажа, поэтому возможно, что данное имя приобретает особое значение в контексте будущей роли Аврама. В то же время связывать его напрямую с социальным статусом семьи затруднительно, поскольку текст не даёт для этого явных оснований.
Значения имён Нахора и Харана остаются дискуссионными, поэтому в рамках данного анализа они не рассматриваются.
`,
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
        id: 'genesis11_2',
        path: 'Берешит 11:27',
        title: ' И это история Тераха: Терах родил Аврама, Нахора и Арана; Аран родил Лота.',
        text:
          '',
        assets: [
         
        ]
      },
      {
        id: 'genesis11_3',
        path: 'Берешит 11:28',
        title: 'Аран умер на глазах у отца своего в стране рождения своего, в Уре Халдейском.',
        text:
          `Смерть Арана при жизни Тераха оставляет его сына Лота без отца. В условиях древневосточного общества это означало, что он продолжал находиться в составе дома своего деда, Тераха, который сохранял статус главы семьи.
В патриархальной структуре древнего Ближнего Востока семья представляла собой расширенный дом (bet av), объединяющий несколько поколений. Члены такого дома находились под властью и ответственностью старшего мужчины, который выступал как его глава.
Таким образом, положение Лота после смерти отца можно рассматривать как зависимое внутри семейной структуры Тераха. В дальнейшем это объясняет, почему он оказывается связан с Аврамом и следует за ним, выступая не как самостоятельный персонаж, а как часть семейной группы.
`,
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
