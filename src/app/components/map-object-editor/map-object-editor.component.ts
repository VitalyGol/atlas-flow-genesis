import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MapObject } from '../../core/models/story.models';

@Component({
  selector: 'app-map-object-editor',
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './map-object-editor.component.html',
  styleUrl: './map-object-editor.component.scss'
})
export class MapObjectEditorComponent {
  readonly mapObject = input<MapObject | null>(null);
  readonly saved = output<MapObject>();

  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    id: ['', Validators.required],
    name: ['', Validators.required],
    type: ['', Validators.required],
    period: ['', Validators.required],
    coordinates: ['', Validators.required],
    sceneIds: ['', Validators.required],
    detail: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const mapObject = this.mapObject();
      this.form.reset({
        id: mapObject?.id ?? '',
        name: mapObject?.name ?? '',
        type: mapObject?.type ?? '',
        period: mapObject?.period ?? '',
        coordinates: mapObject?.coordinates ?? '',
        sceneIds: mapObject?.sceneIds.join(', ') ?? '',
        detail: mapObject?.detail ?? ''
      });
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      id: value.id,
      name: value.name,
      type: value.type,
      period: value.period,
      coordinates: value.coordinates,
      sceneIds: value.sceneIds.split(','),
      detail: value.detail
    });
  }

  protected reset(): void {
    this.form.reset({
      id: '',
      name: '',
      type: '',
      period: '',
      coordinates: '',
      sceneIds: '',
      detail: ''
    });
  }
}
