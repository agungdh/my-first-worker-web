import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { roleLabel } from '../../core/constants/pegawai';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forbidden-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page">
      <mat-card appearance="outlined" class="denied-card">
        <mat-card-content class="denied">
          <span class="denied-icon" aria-hidden="true"><mat-icon>block</mat-icon></span>
          <h1>Akses ditolak</h1>
          <p class="text-muted">
            Akun Anda tidak memiliki akses admin. Hubungi administrator untuk meminta akses.
          </p>

          <dl class="identity">
            <div>
              <dt>Nama</dt>
              <dd>{{ user()?.nama ?? '—' }}</dd>
            </div>
            <div>
              <dt>NIP</dt>
              <dd>{{ user()?.nip ?? '—' }}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{{ role() }}</dd>
            </div>
          </dl>

          <button mat-flat-button type="button" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Keluar
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .denied-card {
      max-width: 560px;
      margin: 0 auto;
      border-radius: 16px;
      background: var(--mat-sys-surface);
    }

    .denied {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 24px;
      text-align: center;
    }

    .denied-icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }

    .denied h1 {
      font: var(--mat-sys-headline-small);
    }

    .identity {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      width: 100%;
      margin: 8px 0;
      padding: 16px;
      border-radius: 12px;
      background: var(--mat-sys-surface-container);
    }

    .identity div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    dt {
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
    }

    dd {
      margin: 0;
      font-weight: 500;
      word-break: break-word;
    }
  `,
})
export class ForbiddenPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly role = computed(() => {
    const user = this.user();
    return user ? roleLabel(user.role) : '—';
  });

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }
}
