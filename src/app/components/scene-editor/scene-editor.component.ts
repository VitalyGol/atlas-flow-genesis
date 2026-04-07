import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Scene } from '../../core/models/story.models';

@Component({
  selector: 'app-scene-editor',
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './scene-editor.component.html',
  styleUrl: './scene-editor.component.scss'
})
export class SceneEditorComponent {
  readonly scene = input<Scene | null>(null);
  readonly saved = output<Scene>();

  private readonly formBuilder = inject(FormBuilder);

  protected readonly form = this.formBuilder.nonNullable.group({
    id: ['', Validators.required],
    title: ['', Validators.required],
    period: ['', Validators.required],
    tags: [''],
    text: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const scene = this.scene();
      this.form.reset({
        id: scene?.id ?? '',
        title: scene?.title ?? '',
        period: scene?.period ?? '',
        tags: scene?.tags.join(', ') ?? '',
        text: scene?.text ?? ''
      });
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const existingScene = this.scene();
    this.saved.emit({
      id: value.id,
      title: value.title,
      period: value.period,
      tags: value.tags.split(','),
      text: value.text,
      paragraphs: existingScene?.paragraphs ?? []
    });
  }

  protected reset(): void {
    this.form.reset({
      id: '',
      title: '',
      period: '',
      tags: '',
      text: ''
    });
  }
}
