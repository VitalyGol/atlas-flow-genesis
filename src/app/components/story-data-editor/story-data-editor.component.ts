import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { StoryDataDocument } from '../../core/models/editor.models';
import { coordinateStringValidator } from '../../core/validators/editor.validators';

@Component({
  selector: 'app-story-data-editor',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './story-data-editor.component.html',
  styleUrl: './story-data-editor.component.scss',
})
export class StoryDataEditorComponent {
  readonly document = input<StoryDataDocument>({ scenes: [], mapObjects: [] });
  readonly saved = output<StoryDataDocument>();

  private readonly formBuilder = inject(FormBuilder);

  protected readonly selectedSceneIndex = signal(0);
  protected readonly selectedMapObjectIndex = signal(0);
  protected readonly form = this.formBuilder.group({
    scenes: this.formBuilder.array([]),
    mapObjects: this.formBuilder.array([]),
  });

  constructor() {
    effect(() => {
      this.replaceDocument(this.document());
    });
  }

  protected get scenesArray(): FormArray {
    return this.form.get('scenes') as FormArray;
  }

  protected get mapObjectsArray(): FormArray {
    return this.form.get('mapObjects') as FormArray;
  }

  protected sceneControls(): AbstractControl[] {
    return this.scenesArray.controls;
  }

  protected mapObjectControls(): AbstractControl[] {
    return this.mapObjectsArray.controls;
  }

  protected selectedSceneGroup(): FormGroup | null {
    return (this.scenesArray.at(this.selectedSceneIndex()) as FormGroup | undefined) ?? null;
  }

  protected selectedMapObjectGroup(): FormGroup | null {
    return (
      (this.mapObjectsArray.at(this.selectedMapObjectIndex()) as FormGroup | undefined) ?? null
    );
  }

  protected selectScene(index: number): void {
    this.selectedSceneIndex.set(index);
  }

  protected selectMapObject(index: number): void {
    this.selectedMapObjectIndex.set(index);
  }

  protected addScene(): void {
    this.scenesArray.push(this.createSceneGroup());
    this.selectedSceneIndex.set(this.scenesArray.length - 1);
  }

  protected removeScene(index: number): void {
    this.scenesArray.removeAt(index);
    this.selectedSceneIndex.set(
      Math.max(0, Math.min(this.selectedSceneIndex(), this.scenesArray.length - 1)),
    );
  }

  protected addParagraph(sceneGroup: AbstractControl): void {
    this.paragraphsArray(sceneGroup).push(this.createParagraphGroup());
  }

  protected removeParagraph(sceneGroup: AbstractControl, index: number): void {
    this.paragraphsArray(sceneGroup).removeAt(index);
  }

  protected addAsset(paragraphGroup: AbstractControl): void {
    this.assetsArray(paragraphGroup).push(this.createAssetGroup());
  }

  protected removeAsset(paragraphGroup: AbstractControl, index: number): void {
    this.assetsArray(paragraphGroup).removeAt(index);
  }

  protected addMapObject(): void {
    this.mapObjectsArray.push(this.createMapObjectGroup());
    this.selectedMapObjectIndex.set(this.mapObjectsArray.length - 1);
  }

  protected removeMapObject(index: number): void {
    this.mapObjectsArray.removeAt(index);
    this.selectedMapObjectIndex.set(
      Math.max(0, Math.min(this.selectedMapObjectIndex(), this.mapObjectsArray.length - 1)),
    );
  }

  protected paragraphsArray(sceneGroup: AbstractControl): FormArray {
    return sceneGroup.get('paragraphs') as FormArray;
  }

  protected assetsArray(paragraphGroup: AbstractControl): FormArray {
    return paragraphGroup.get('assets') as FormArray;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saved.emit({
      scenes: this.scenesArray.controls.map((control) => this.normalizeScene(control as FormGroup)),
      mapObjects: this.mapObjectsArray.controls.map((control) =>
        this.normalizeMapObject(control as FormGroup),
      ),
    });
  }

  private replaceDocument(document: StoryDataDocument): void {
    this.scenesArray.clear();
    this.mapObjectsArray.clear();

    for (const scene of document.scenes) {
      this.scenesArray.push(this.createSceneGroup(scene));
    }

    for (const mapObject of document.mapObjects) {
      this.mapObjectsArray.push(this.createMapObjectGroup(mapObject));
    }

    if (!this.scenesArray.length) {
      this.scenesArray.push(this.createSceneGroup());
    }

    if (!this.mapObjectsArray.length) {
      this.mapObjectsArray.push(this.createMapObjectGroup());
    }

    this.selectedSceneIndex.set(Math.min(this.selectedSceneIndex(), this.scenesArray.length - 1));
    this.selectedMapObjectIndex.set(
      Math.min(this.selectedMapObjectIndex(), this.mapObjectsArray.length - 1),
    );
  }

  private createSceneGroup(scene?: StoryDataDocument['scenes'][number]): FormGroup {
    return this.formBuilder.group({
      id: [scene?.id ?? '', Validators.required],
      title: [scene?.title ?? '', Validators.required],
      period: [scene?.period ?? '', Validators.required],
      text: [scene?.text ?? '', Validators.required],
      tags: [scene?.tags.join(', ') ?? '', Validators.required],
      paragraphs: this.formBuilder.array(
        (scene?.paragraphs ?? []).map((paragraph) => this.createParagraphGroup(paragraph)),
      ),
    });
  }

  private createParagraphGroup(
    paragraph?: NonNullable<StoryDataDocument['scenes'][number]['paragraphs']>[number],
  ): FormGroup {
    return this.formBuilder.group({
      id: [paragraph?.id ?? '', Validators.required],
      path: [paragraph?.path ?? '', Validators.required],
      title: [paragraph?.title ?? '', Validators.required],
      text: [paragraph?.text ?? '', Validators.required],
      assets: this.formBuilder.array(
        (paragraph?.assets ?? []).map((asset) => this.createAssetGroup(asset)),
      ),
    });
  }

  private createAssetGroup(
    asset?: NonNullable<
      NonNullable<StoryDataDocument['scenes'][number]['paragraphs']>[number]['assets']
    >[number],
  ): FormGroup {
    return this.formBuilder.group({
      id: [asset?.id ?? '', Validators.required],
      type: [asset?.type ?? 'map', Validators.required],
      title: [asset?.title ?? '', Validators.required],
      description: [asset?.description ?? '', Validators.required],
      imageUrl: [asset?.imageUrl ?? ''],
      locationLabel: [asset?.locationLabel ?? ''],
      coordinates: [asset?.coordinates ?? '', coordinateStringValidator(false)],
      mapTopicId: [asset?.mapTopicId ?? ''],
    });
  }

  private createMapObjectGroup(mapObject?: StoryDataDocument['mapObjects'][number]): FormGroup {
    return this.formBuilder.group({
      id: [mapObject?.id ?? '', Validators.required],
      name: [mapObject?.name ?? '', Validators.required],
      type: [mapObject?.type ?? '', Validators.required],
      period: [mapObject?.period ?? '', Validators.required],
      coordinates: [
        mapObject?.coordinates ?? '',
        [Validators.required, coordinateStringValidator()],
      ],
      detail: [mapObject?.detail ?? '', Validators.required],
      sceneIds: [mapObject?.sceneIds.join(', ') ?? '', Validators.required],
    });
  }

  private normalizeScene(sceneGroup: FormGroup) {
    return {
      id: String(sceneGroup.get('id')?.value ?? '').trim(),
      title: String(sceneGroup.get('title')?.value ?? '').trim(),
      period: String(sceneGroup.get('period')?.value ?? '').trim(),
      text: String(sceneGroup.get('text')?.value ?? '').trim(),
      tags: this.normalizeCsv(sceneGroup.get('tags')?.value),
      paragraphs: this.paragraphsArray(sceneGroup).controls.map((paragraphGroup) => ({
        id: String(paragraphGroup.get('id')?.value ?? '').trim(),
        path: String(paragraphGroup.get('path')?.value ?? '').trim(),
        title: String(paragraphGroup.get('title')?.value ?? '').trim(),
        text: String(paragraphGroup.get('text')?.value ?? '').trim(),
        assets: this.assetsArray(paragraphGroup).controls.map((assetGroup) => ({
          id: String(assetGroup.get('id')?.value ?? '').trim(),
          type: assetGroup.get('type')?.value,
          title: String(assetGroup.get('title')?.value ?? '').trim(),
          description: String(assetGroup.get('description')?.value ?? '').trim(),
          imageUrl: this.optionalTrim(assetGroup.get('imageUrl')?.value),
          locationLabel: this.optionalTrim(assetGroup.get('locationLabel')?.value),
          coordinates: this.optionalTrim(assetGroup.get('coordinates')?.value),
          mapTopicId: this.optionalTrim(assetGroup.get('mapTopicId')?.value),
        })),
      })),
    };
  }

  private normalizeMapObject(mapObjectGroup: FormGroup) {
    return {
      id: String(mapObjectGroup.get('id')?.value ?? '').trim(),
      name: String(mapObjectGroup.get('name')?.value ?? '').trim(),
      type: String(mapObjectGroup.get('type')?.value ?? '').trim(),
      period: String(mapObjectGroup.get('period')?.value ?? '').trim(),
      coordinates: String(mapObjectGroup.get('coordinates')?.value ?? '').trim(),
      detail: String(mapObjectGroup.get('detail')?.value ?? '').trim(),
      sceneIds: this.normalizeCsv(mapObjectGroup.get('sceneIds')?.value),
    };
  }

  private normalizeCsv(value: unknown): string[] {
    return String(value ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  private optionalTrim(value: unknown): string | undefined {
    const trimmed = String(value ?? '').trim();
    return trimmed || undefined;
  }
}
