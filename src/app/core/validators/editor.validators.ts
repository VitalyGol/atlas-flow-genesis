import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const isFiniteNumber = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  return Number.isFinite(Number(value));
};

export const numberLikeValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null =>
    isFiniteNumber(control.value) ? null : { numberLike: true };
};

export const coordinateStringValidator = (required = true): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();

    if (!value) {
      return required ? { coordinateString: true } : null;
    }

    const parts = value.split(',').map((entry) => entry.trim());

    if (parts.length !== 2 || !parts.every((entry) => isFiniteNumber(entry))) {
      return { coordinateString: true };
    }

    return null;
  };
};

export const minItemsValidator = (min: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const length = Array.isArray(value) ? value.length : 0;
    return length >= min ? null : { minItems: { min, actual: length } };
  };
};
