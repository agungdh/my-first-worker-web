import {
  maxLength,
  minLength,
  pattern,
  required,
  schema,
  validate,
  type ValidationError,
} from '@angular/forms/signals';
import type { LoginInput, RegisterInput, ValidationSample } from '../models/api.models';

export interface TaskFormModel {
  name: string;
  slug: string;
  description: string;
  due_date: string;
  completed: boolean;
}

type Check = readonly [kind: string, failed: boolean, message: string];

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

function failedChecks(checks: readonly Check[]): ValidationError.WithoutFieldTree[] {
  return checks.filter(([, failed]) => failed).map(([kind, , message]) => ({ kind, message }));
}

export const loginSchema = schema<LoginInput>((path) => {
  required(path.username, { message: 'Username is required.' });
  required(path.password, { message: 'Password is required.' });
});

export const registerSchema = schema<RegisterInput>((path) => {
  required(path.name, { message: 'Name is required.' });
  maxLength(path.name, 100, { message: 'Name must be 100 characters or fewer.' });

  required(path.username, { message: 'Username is required.' });
  minLength(path.username, 3, { message: 'Username must be at least 3 characters.' });
  maxLength(path.username, 32, { message: 'Username must be 32 characters or fewer.' });
  pattern(path.username, USERNAME_PATTERN, {
    message: 'Use only letters, numbers, dots, underscores and hyphens.',
  });

  required(path.password, { message: 'Password is required.' });
  minLength(path.password, 8, { message: 'Password must be at least 8 characters.' });
  maxLength(path.password, 128, { message: 'Password must be 128 characters or fewer.' });
});

export const taskFormSchema = schema<TaskFormModel>((path) => {
  required(path.name, { message: 'Name is required.' });

  required(path.slug, { message: 'Slug is required.' });
  pattern(path.slug, SLUG_PATTERN, {
    message: 'Use lowercase letters, numbers and hyphens only.',
  });

  required(path.due_date, { message: 'Due date is required.' });
});

export const validationSampleSchema = schema<ValidationSample>((path) => {
  validate(path.name, ({ value }) => {
    const name = value();

    return failedChecks([
      ['name.minLength', name.length < 3, 'name minimal 3 karakter'],
      ['name.maxLength', name.length > 50, 'name maksimal 50 karakter'],
      ['name.noWhitespace', /\s/.test(name), 'name tidak boleh mengandung spasi'],
      ['name.uppercase', !/[A-Z]/.test(name), 'name harus mengandung minimal 1 huruf besar'],
      ['name.number', !/[0-9]/.test(name), 'name harus mengandung minimal 1 angka'],
    ]);
  });

  validate(path.email, ({ value }) => {
    const email = value();

    return failedChecks([
      ['email.atSign', !email.includes('@'), 'email harus mengandung @'],
      ['email.dot', !email.includes('.'), 'email harus mengandung titik'],
      ['email.maxLength', email.length > 100, 'email maksimal 100 karakter'],
    ]);
  });

  validate(path.password, ({ value }) => {
    const password = value();

    return failedChecks([
      ['password.minLength', password.length < 8, 'password minimal 8 karakter'],
      ['password.uppercase', !/[A-Z]/.test(password), 'password harus mengandung huruf besar'],
      ['password.lowercase', !/[a-z]/.test(password), 'password harus mengandung huruf kecil'],
      ['password.number', !/[0-9]/.test(password), 'password harus mengandung angka'],
      ['password.symbol', !/[^A-Za-z0-9]/.test(password), 'password harus mengandung simbol'],
    ]);
  });
});
