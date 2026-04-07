import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { MapObject } from '../../core/models/story.models';

@Component({
  selector: 'app-map-object-panel',
  imports: [MatCardModule, MatChipsModule],
  templateUrl: './map-object-panel.component.html',
  styleUrl: './map-object-panel.component.scss'
})
export class MapObjectPanelComponent {
  readonly mapObjects = input.required<MapObject[]>();
}
