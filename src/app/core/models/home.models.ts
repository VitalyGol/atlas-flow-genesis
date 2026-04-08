import * as L from 'leaflet';

export interface TopicPolygon {
  id: string;
  name: string;
  description: string;
  points: L.LatLngTuple[];
}

export interface TopicLabel {
  id: string;
  name: string;
  description: string;
  position: L.LatLngTuple;
}

export interface TopicPolyline {
  id: string;
  name: string;
  description: string;
  points: L.LatLngTuple[];
}

export interface MapTopic {
  id: string;
  name: string;
  description: string;
  center: L.LatLngTuple;
  zoom: number;
  sceneId: string;
  polyline: TopicPolyline[];
  polygons: TopicPolygon[];
  labels: TopicLabel[];
}
