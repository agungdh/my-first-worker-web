import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { RegisterInput } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { registerSchema } from '../../../core/validation/form-schemas';

@Component({
  selector: 'app-register-page',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly model = signal<RegisterInput>({
    username: '',
    name: '',
    password: '',
  });

  readonly form = form(this.model, registerSchema);

  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  submit(event: Event): void {
    event.preventDefault();

    if (this.submitting()) return;

    const formState = this.form();
    if (formState.invalid()) {
      formState.markAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.auth.register(formState.value()).subscribe({
      next: () => void this.router.navigateByUrl('/dashboard'),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error instanceof HttpErrorResponse && error.status === 409
            ? 'That username is already taken.'
            : apiErrorMessage(error, 'Unable to create your account.'),
        );
      },
    });
  }
}
