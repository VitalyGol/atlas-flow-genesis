export interface SceneAsset {
  id: string;
  type: 'map' | 'image';
  title: string;
  description: string;
  imageUrl?: string;
  locationLabel?: string;
  coordinates?: string;
  mapTopicId?: string;
}

export interface SceneParagraph {
  id: string;
  path: string;
  title: string;
  text: string;
  assets: SceneAsset[];
}

export interface Scene {
  id: string;
  title: string;
  text: string;
  tags: string[];
  period: string;
  paragraphs?: SceneParagraph[];
}

export interface MapObject {
  id: string;
  name: string;
  type: string;
  period: string;
  coordinates: string;
  detail: string;
  sceneIds: string[];
}
