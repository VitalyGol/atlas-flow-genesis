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

import { MapTopic } from '../../core/models/home.models';
import { minItemsValidator, numberLikeValidator } from '../../core/validators/editor.validators';

@Component({
  selector: 'app-home-topics-editor',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './home-topics-editor.component.html',
  styleUrl: './home-topics-editor.component.scss',
})
export class HomeTopicsEditorComponent {
  readonly topics = input<MapTopic[]>([]);
  readonly saved = output<MapTopic[]>();

  private readonly formBuilder = inject(FormBuilder);

  protected readonly selectedTopicIndex = signal(0);
  protected readonly form = this.formBuilder.group({
    topics: this.formBuilder.array([]),
  });

  constructor() {
    effect(() => {
      const topics = this.topics();
      this.replaceTopics(topics);
    });
  }

  protected get topicsArray(): FormArray {
    return this.form.get('topics') as FormArray;
  }

  protected selectTopic(index: number): void {
    this.selectedTopicIndex.set(index);
  }

  protected addTopic(): void {
    this.topicsArray.push(this.createTopicGroup());
    this.selectedTopicIndex.set(this.topicsArray.length - 1);
  }

  protected removeTopic(index: number): void {
    this.topicsArray.removeAt(index);
    this.selectedTopicIndex.set(
      Math.max(0, Math.min(this.selectedTopicIndex(), this.topicsArray.length - 1)),
    );
  }

  protected selectedTopicGroup(): FormGroup | null {
    return (this.topicsArray.at(this.selectedTopicIndex()) as FormGroup | undefined) ?? null;
  }

  protected topicControls(): AbstractControl[] {
    return this.topicsArray.controls;
  }

  protected labelsArray(topicGroup: AbstractControl): FormArray {
    return topicGroup.get('labels') as FormArray;
  }

  protected polylineArray(topicGroup: AbstractControl): FormArray {
    return topicGroup.get('polyline') as FormArray;
  }

  protected polygonsArray(topicGroup: AbstractControl): FormArray {
    return topicGroup.get('polygons') as FormArray;
  }

  protected pointsArray(control: AbstractControl): FormArray {
    return control.get('points') as FormArray;
  }

  protected addLabel(topicGroup: AbstractControl): void {
    this.labelsArray(topicGroup).push(this.createLabelGroup());
  }

  protected removeLabel(topicGroup: AbstractControl, index: number): void {
    this.labelsArray(topicGroup).removeAt(index);
  }

  protected addPolyline(topicGroup: AbstractControl): void {
    this.polylineArray(topicGroup).push(this.createLineOrPolygonGroup(2));
  }

  protected removePolyline(topicGroup: AbstractControl, index: number): void {
    this.polylineArray(topicGroup).removeAt(index);
  }

  protected addPolygon(topicGroup: AbstractControl): void {
    this.polygonsArray(topicGroup).push(this.createLineOrPolygonGroup(3));
  }

  protected removePolygon(topicGroup: AbstractControl, index: number): void {
    this.polygonsArray(topicGroup).removeAt(index);
  }

  protected addPoint(control: AbstractControl): void {
    this.pointsArray(control).push(this.createPointGroup());
  }

  protected removePoint(control: AbstractControl, index: number): void {
    this.pointsArray(control).removeAt(index);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const topics = this.topicsArray.controls.map((control) =>
      this.normalizeTopic(control as FormGroup),
    );
    this.saved.emit(topics);
  }

  private replaceTopics(topics: MapTopic[]): void {
    this.topicsArray.clear();

    for (const topic of topics) {
      this.topicsArray.push(this.createTopicGroup(topic));
    }

    if (!this.topicsArray.length) {
      this.topicsArray.push(this.createTopicGroup());
    }

    this.selectedTopicIndex.set(Math.min(this.selectedTopicIndex(), this.topicsArray.length - 1));
  }

  private createTopicGroup(topic?: MapTopic): FormGroup {
    return this.formBuilder.group({
      id: [topic?.id ?? '', Validators.required],
      name: [topic?.name ?? '', Validators.required],
      description: [topic?.description ?? '', Validators.required],
      sceneId: [topic?.sceneId ?? '', Validators.required],
      zoom: [topic?.zoom ?? 6, [Validators.required, numberLikeValidator()]],
      centerLat: [topic?.center?.[0] ?? '', [Validators.required, numberLikeValidator()]],
      centerLng: [topic?.center?.[1] ?? '', [Validators.required, numberLikeValidator()]],
      labels: this.formBuilder.array(
        (topic?.labels ?? []).map((label) => this.createLabelGroup(label)),
      ),
      polyline: this.formBuilder.array(
        (topic?.polyline ?? []).map((line) => this.createLineOrPolygonGroup(2, line)),
      ),
      polygons: this.formBuilder.array(
        (topic?.polygons ?? []).map((polygon) => this.createLineOrPolygonGroup(3, polygon)),
      ),
    });
  }

  private createLabelGroup(label?: MapTopic['labels'][number]): FormGroup {
    return this.formBuilder.group({
      id: [label?.id ?? '', Validators.required],
      name: [label?.name ?? '', Validators.required],
      description: [label?.description ?? '', Validators.required],
      lat: [label?.position?.[0] ?? '', [Validators.required, numberLikeValidator()]],
      lng: [label?.position?.[1] ?? '', [Validators.required, numberLikeValidator()]],
    });
  }

  private createLineOrPolygonGroup(
    minPoints: number,
    item?: MapTopic['polyline'][number] | MapTopic['polygons'][number],
  ): FormGroup {
    return this.formBuilder.group({
      id: [item?.id ?? '', Validators.required],
      name: [item?.name ?? '', Validators.required],
      description: [item?.description ?? '', Validators.required],
      points: this.formBuilder.array(
        (item?.points ?? Array.from({ length: minPoints }, () => [0, 0] as [number, number])).map(
          (point) => this.createPointGroup([point[0], point[1]]),
        ),
        [minItemsValidator(minPoints)],
      ),
    });
  }

  private createPointGroup(point?: [number, number] | number[]): FormGroup {
    return this.formBuilder.group({
      lat: [point?.[0] ?? '', [Validators.required, numberLikeValidator()]],
      lng: [point?.[1] ?? '', [Validators.required, numberLikeValidator()]],
    });
  }

  private normalizeTopic(topicGroup: FormGroup): MapTopic {
    return {
      id: String(topicGroup.get('id')?.value ?? '').trim(),
      name: String(topicGroup.get('name')?.value ?? '').trim(),
      description: String(topicGroup.get('description')?.value ?? '').trim(),
      sceneId: String(topicGroup.get('sceneId')?.value ?? '').trim(),
      zoom: Number(topicGroup.get('zoom')?.value ?? 0),
      center: [
        Number(topicGroup.get('centerLat')?.value ?? 0),
        Number(topicGroup.get('centerLng')?.value ?? 0),
      ] as [number, number],
      labels: this.labelsArray(topicGroup).controls.map((control) => ({
        id: String(control.get('id')?.value ?? '').trim(),
        name: String(control.get('name')?.value ?? '').trim(),
        description: String(control.get('description')?.value ?? '').trim(),
        position: [
          Number(control.get('lat')?.value ?? 0),
          Number(control.get('lng')?.value ?? 0),
        ] as [number, number],
      })),
      polyline: this.polylineArray(topicGroup).controls.map((control) =>
        this.normalizeShape(control),
      ),
      polygons: this.polygonsArray(topicGroup).controls.map((control) =>
        this.normalizeShape(control),
      ),
    };
  }

  private normalizeShape(control: AbstractControl) {
    return {
      id: String(control.get('id')?.value ?? '').trim(),
      name: String(control.get('name')?.value ?? '').trim(),
      description: String(control.get('description')?.value ?? '').trim(),
      points: this.pointsArray(control).controls.map(
        (pointControl) =>
          [
            Number(pointControl.get('lat')?.value ?? 0),
            Number(pointControl.get('lng')?.value ?? 0),
          ] as [number, number],
      ),
    };
  }
}
