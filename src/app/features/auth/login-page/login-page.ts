import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { LoginInput } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { loginSchema } from '../../../core/validation/form-schemas';

@Component({
  selector: 'app-login-page',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly model = signal<LoginInput>({ username: '', password: '' });

  readonly form = form(this.model, loginSchema);

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

    this.auth.login(formState.value()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const target = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard';
        void this.router.navigateByUrl(target);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error instanceof HttpErrorResponse && error.status === 401
            ? 'Invalid username or password.'
            : apiErrorMessage(error, 'Unable to sign in.'),
        );
      },
    });
  }
}
