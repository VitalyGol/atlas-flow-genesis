import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import * as L from 'leaflet';
import 'leaflet-providers';
import { HomeDataService, MapTopic } from '../../core/services/home-data.service';

interface TopicLayers {
  polyline: L.Polyline[];
  polygons: L.Polygon[];
  labels: L.Marker[];
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatListModule, MatSidenavModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapHost', { static: true }) private readonly mapHost?: ElementRef<HTMLDivElement>;

  private readonly router = inject(Router);
  private readonly homeDataService = inject(HomeDataService);

  protected readonly selectedTopicId = signal('part-one');
  protected readonly topics: MapTopic[] = this.homeDataService.topics;

  private map?: L.Map;
  private readonly topicLayers = new Map<string, TopicLayers>();

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  protected focusTopic(topic: MapTopic, drawer?: MatSidenav): void {
    const map = this.map;
    const layers = this.topicLayers.get(topic.id);

    if (!map || !layers) {
      return;
    }

    this.selectedTopicId.set(topic.id);
    this.syncTopicStyles();

    const bounds = L.latLngBounds([]);

    for (const polygon of layers.polygons) {
      bounds.extend(polygon.getBounds());
      polygon.openPopup();
    }

    for (const label of layers.labels) {
      bounds.extend(label.getLatLng());
    }

    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        duration: 0.8,
        maxZoom: topic.zoom,
        padding: [72, 72],
      });
    } else {
      map.flyTo(topic.center, topic.zoom, { duration: 0.8 });
    }
  }

  protected viewTopic(topic: MapTopic, drawer?: MatSidenav): void {
    void this.router.navigate(['/scenes', topic.sceneId]);
  }

  private initializeMap(): void {
    const host = this.mapHost?.nativeElement;

    if (!host) {
      return;
    }

    this.map = L.map(host, {
      zoomControl: false,
      attributionControl: true,
      maxZoom: 17,
    }).setView(this.topics[0].center, this.topics[0].zoom);

    L.control.zoom({ position: 'bottomleft' }).addTo(this.map);

    L.tileLayer
      .provider('OpenTopoMap', {
        maxZoom: 17,
        maxNativeZoom: 17,
      })
      .addTo(this.map);

    for (const topic of this.topics) {
      const polygons = topic.polygons.map((polygonData) => {
        const polygon = L.polygon(polygonData.points, {
          color: '#124e78',
          weight: 2,
          fillColor: '#3ea6d8',
          fillOpacity: 0.34,
        })
          .addTo(this.map!)
          .bindPopup(`<strong>${topic.name}</strong><br>${topic.description}`);

        polygon.on('click', () => this.focusTopic(topic));
        return polygon;
      });

      const polyline = topic.polyline.map((polygonData) => {
        const polyline = L.polyline(polygonData.points, {
          color: '#124e78',
          weight: 3,
        })
          .addTo(this.map!)
          .bindPopup(`<strong>${polygonData.name}</strong><br>${polygonData.description}`);

        polyline.on('click', () => this.focusTopic(topic));
        return polyline;
      });

      const labels = topic.labels.map((labelData) => {
        const marker = L.marker(labelData.position, {
          icon: L.divIcon({
            className: 'topic-label-marker',
            html: `<span class="topic-label-chip">${labelData.name}</span>`,
            iconSize: [0, 0],
          }),
        })
          .addTo(this.map!)
          .bindPopup(`<strong>${topic.name}</strong><br>${labelData.description}`);

        marker.on('click', () => this.focusTopic(topic));
        return marker;
      });

      this.topicLayers.set(topic.id, { polygons, labels, polyline });
    }

    this.syncTopicStyles();
    this.focusTopic(this.topics[0]);
  }

  private syncTopicStyles(): void {
    for (const topic of this.topics) {
      const layers = this.topicLayers.get(topic.id);

      if (!layers) {
        continue;
      }

      const isSelected = this.selectedTopicId() === topic.id;

      for (const polygon of layers.polygons) {
        polygon.setStyle({
          color: isSelected ? '#07243a' : '#124e78',
          fillColor: isSelected ? '#ffb347' : '#3ea6d8',
          fillOpacity: isSelected ? 0.5 : 0.34,
          weight: isSelected ? 3 : 2,
        });

        if (isSelected) {
          polygon.bringToFront();
        }
      }

      for (const polygon of layers.polyline) {
        polygon.setStyle({
          color: isSelected ? 'red' : '#124e78',
          fillOpacity: isSelected ? 0.5 : 0.34,
          weight: isSelected ? 3 : 2,
        });

        if (isSelected) {
          polygon.bringToFront();
        }
      }


      for (const polygon of layers.polygons) {
        polygon.setStyle({
          color: isSelected ? '#07243a' : '#124e78',
          fillColor: isSelected ? '#ffb347' : '#3ea6d8',
          fillOpacity: isSelected ? 0.5 : 0.34,
          weight: isSelected ? 3 : 2,
        });

        if (isSelected) {
          polygon.bringToFront();
        }
      }

      for (const label of layers.labels) {
        const element = label.getElement();
        element?.classList.toggle('selected', isSelected);
      }
    }
  }
}
