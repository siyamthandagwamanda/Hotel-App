import { HttpError } from '../middleware/errorHandler';

// Small checks for values that arrive in a request body. Each throws a 400 with a plain message.

export function readText(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== 'string' || value.trim() === '' || value.trim().length > maxLength) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} is required (up to ${maxLength} characters).`);
  }
  return value.trim();
}

export function readWhole(value: unknown, name: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} must be a whole number from ${min} to ${max}.`);
  }
  return value;
}

export function readDecimal(value: unknown, name: string, min: number, max: number): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < min || value > max) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} must be a number from ${min} to ${max}.`);
  }
  return value;
}

export function readChoice(value: unknown, name: string, choices: string[]): string {
  if (typeof value !== 'string' || !choices.includes(value)) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} must be one of: ${choices.join(', ')}.`);
  }
  return value;
}