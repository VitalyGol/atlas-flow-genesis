import { MapTopic } from './home.models';
import { MapObject, Scene } from './story.models';

export type EditorEntity = 'home-topics' | 'story-data';

export interface StoryDataDocument {
  scenes: Scene[];
  mapObjects: MapObject[];
}

export interface EditorSaveResponse {
  entity: EditorEntity;
  filePath: string;
  backupPath: string;
  savedAt: string;
}
