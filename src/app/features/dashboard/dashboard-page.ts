import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { apiErrorMessage } from '../../core/http/api-error';
import type { Task } from '../../core/models/api.models';
import { TaskService } from '../../core/services/task.service';
import { toTaskView } from '../../core/util/task-view';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly tasksService = inject(TaskService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly tasks = signal<Task[]>([]);

  readonly stats = computed(() => {
    const views = this.tasks().map((task) => toTaskView(task));

    return {
      total: views.length,
      completed: views.filter((task) => task.status === 'completed').length,
      pending: views.filter((task) => task.status === 'pending').length,
      overdue: views.filter((task) => task.status === 'overdue').length,
    };
  });

  readonly completionRate = computed(() => {
    const { total, completed } = this.stats();
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  });

  readonly upcoming = computed(() =>
    this.tasks()
      .filter((task) => !task.completed)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 5)
      .map((task) => toTaskView(task)),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.tasksService.listAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadError.set(apiErrorMessage(error, 'Could not load your dashboard.'));
        this.loading.set(false);
      },
    });
  }

  createTask(): void {
    void this.router.navigate(['/tasks'], { queryParams: { create: '1' } });
  }

  goToTasks(): void {
    void this.router.navigateByUrl('/tasks');
  }
}
