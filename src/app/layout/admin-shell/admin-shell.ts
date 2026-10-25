import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule, type MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-shell',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly apiBaseUrl = API_BASE_URL;
  readonly isMobile = toSignal(
    this.breakpoint.observe('(max-width: 959px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: '/dashboard' },
    { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
    { label: 'Validation lab', icon: 'rule', route: '/validation' },
  ];

  private readonly navigation = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ),
    { initialValue: null },
  );

  readonly pageTitle = computed(() =>
    this.resolveTitle(this.navigation()?.urlAfterRedirects ?? this.router.url),
  );

  readonly initials = computed(() => {
    const name = this.user()?.name.trim();
    if (!name) return 'U';

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });

  closeOnMobile(drawer: MatSidenav): void {
    if (this.isMobile()) void drawer.close();
  }

  logout(): void {
    this.auth.logout().subscribe(() => void this.router.navigateByUrl('/login'));
  }

  private resolveTitle(url: string): string {
    const path = url.split('?')[0];

    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/validation')) return 'Validation lab';
    if (path.startsWith('/dashboard')) return 'Dashboard';

    return 'Worker Admin';
  }
}
