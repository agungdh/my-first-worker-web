import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apiErrorMessages } from '../../core/http/api-error';
import type { ValidationSample } from '../../core/models/api.models';
import { ValidationService } from '../../core/services/validation.service';

interface RuleGroup {
  field: string;
  icon: string;
  rules: string[];
}

@Component({
  selector: 'app-validation-page',
  imports: [
    FormField,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './validation-page.html',
  styleUrl: './validation-page.scss',
})
export class ValidationPage {
  private readonly validationService = inject(ValidationService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly model = signal<ValidationSample>({
    name: '',
    email: '',
    password: '',
  });

  readonly form = form(this.model);

  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly errors = signal<string[]>([]);
  readonly result = signal<ValidationSample | null>(null);

  readonly ruleGroups: RuleGroup[] = [
    {
      field: 'Name',
      icon: 'badge',
      rules: [
        '3 to 50 characters',
        'No whitespace',
        'At least one uppercase letter',
        'At least one number',
      ],
    },
    {
      field: 'Email',
      icon: 'alternate_email',
      rules: ['Contains @', 'Contains a dot', 'Up to 100 characters'],
    },
    {
      field: 'Password',
      icon: 'key',
      rules: [
        'At least 8 characters',
        'Uppercase and lowercase letters',
        'At least one number',
        'At least one symbol',
      ],
    },
  ];

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  submit(event: Event): void {
    event.preventDefault();

    if (this.submitting()) return;

    this.submitting.set(true);
    this.errors.set([]);
    this.result.set(null);

    this.validationService.validate(this.form().value()).subscribe({
      next: (data) => {
        this.submitting.set(false);
        this.result.set(data);
        this.snackBar.open('Payload passed validation', 'Dismiss', { duration: 3000 });
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errors.set(apiErrorMessages(error));
      },
    });
  }
}
