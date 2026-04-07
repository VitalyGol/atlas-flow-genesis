import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';

import { Scene } from '../../core/models/story.models';

@Component({
  selector: 'app-scene-list',
  imports: [MatListModule, RouterLink],
  templateUrl: './scene-list.component.html',
  styleUrl: './scene-list.component.scss'
})
export class SceneListComponent {
  readonly scenes = input.required<Scene[]>();
  readonly activeSceneId = input<string | null>(null);
}
