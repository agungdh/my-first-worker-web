import {
  afterNextRender,
  Component,
  computed,
  inject,
  signal,
  type TrackByFunction,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule, type MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, type MatDialogConfig } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, type PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { apiErrorMessage } from '../../core/http/api-error';
import type { Task, TaskStatus, TaskView } from '../../core/models/api.models';
import { TaskService } from '../../core/services/task.service';
import { toTaskView } from '../../core/util/task-view';
import { ConfirmDialog, type ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog';
import { TaskFormDialog, type TaskFormDialogData } from './task-form-dialog/task-form-dialog';

type StatusFilter = 'all' | 'pending' | 'completed';

interface SortState {
  active: string;
  direction: 'asc' | 'desc' | '';
}

interface PageState {
  pageIndex: number;
  pageSize: number;
}

const statusRank: Record<TaskStatus, number> = {
  pending: 0,
  overdue: 1,
  completed: 2,
};

const dialogConfig: MatDialogConfig = {
  width: '560px',
  maxWidth: '94vw',
};

@Component({
  selector: 'app-tasks-page',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.scss',
})
export class TasksPage {
  private readonly tasksService = inject(TaskService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly search = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly sortState = signal<SortState>({ active: 'due_date', direction: 'asc' });
  readonly pageState = signal<PageState>({ pageIndex: 0, pageSize: 10 });

  private readonly views = computed(() => this.tasks().map((task) => toTaskView(task)));

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.views().filter((task) => {
      const matchesStatus =
        status === 'all' || (status === 'completed' ? task.completed : !task.completed);
      const matchesSearch =
        !term ||
        task.name.toLowerCase().includes(term) ||
        task.slug.toLowerCase().includes(term) ||
        (task.description ?? '').toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  });

  readonly sorted = computed(() => {
    const { active, direction } = this.sortState();
    const items = this.filtered();

    if (!direction) return items;

    const factor = direction === 'asc' ? 1 : -1;

    return [...items].sort((a, b) => {
      switch (active) {
        case 'name':
          return a.name.localeCompare(b.name) * factor;
        case 'slug':
          return a.slug.localeCompare(b.slug) * factor;
        case 'due_date':
          return a.due_date.localeCompare(b.due_date) * factor;
        case 'status':
          return (statusRank[a.status] - statusRank[b.status]) * factor;
        default:
          return 0;
      }
    });
  });

  readonly rows = computed(() => {
    const { pageIndex, pageSize } = this.pageState();
    const start = pageIndex * pageSize;

    return this.sorted().slice(start, start + pageSize);
  });

  readonly trackBySlug: TrackByFunction<TaskView> = (_index, task) => task.slug;

  constructor() {
    this.load();

    if (this.route.snapshot.queryParamMap.get('create') === '1') {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
      afterNextRender(() => this.openCreate());
    }
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.tasksService.listAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.clampPage();
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadError.set(apiErrorMessage(error, 'Could not load tasks.'));
        this.loading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.resetPage();
  }

  clearSearch(): void {
    this.search.set('');
    this.resetPage();
  }

  onStatusChange(event: MatButtonToggleChange): void {
    this.statusFilter.set(event.value as StatusFilter);
    this.resetPage();
  }

  onSort(sort: Sort): void {
    this.sortState.set({ active: sort.active, direction: sort.direction });
    this.resetPage();
  }

  onPage(event: PageEvent): void {
    this.pageState.set({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('all');
    this.resetPage();
  }

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Pending';
    }
  }

  openCreate(): void {
    this.dialog
      .open<TaskFormDialog, TaskFormDialogData, Task>(TaskFormDialog, {
        ...dialogConfig,
        data: {},
      })
      .afterClosed()
      .subscribe((task) => {
        if (!task) return;

        this.snackBar.open('Task created', 'Dismiss', { duration: 3500 });
        this.load();
      });
  }

  openEdit(task: TaskView): void {
    this.dialog
      .open<TaskFormDialog, TaskFormDialogData, Task>(TaskFormDialog, {
        ...dialogConfig,
        data: { task },
      })
      .afterClosed()
      .subscribe((task) => {
        if (!task) return;

        this.snackBar.open('Task updated', 'Dismiss', { duration: 3500 });
        this.load();
      });
  }

  toggleCompleted(task: TaskView): void {
    this.tasksService.toggleCompleted(task).subscribe({
      next: (updated) => {
        this.tasks.update((tasks) =>
          tasks.map((item) => (item.slug === task.slug ? updated : item)),
        );
        this.snackBar.open(updated.completed ? 'Task completed' : 'Task reopened', 'Dismiss', {
          duration: 3000,
        });
      },
      error: (error: unknown) => this.showError(error, 'Could not update the task.'),
    });
  }

  confirmDelete(task: TaskView): void {
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        width: '420px',
        maxWidth: '94vw',
        data: {
          title: 'Delete this task?',
          message: `“${task.name}” will be removed from the workspace.`,
          confirmLabel: 'Delete task',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.deleteTask(task);
      });
  }

  private deleteTask(task: TaskView): void {
    this.tasksService.delete(task.slug).subscribe({
      next: () => {
        this.snackBar.open('Task deleted', 'Dismiss', { duration: 3500 });
        this.load();
      },
      error: (error: unknown) => this.showError(error, 'Could not delete the task.'),
    });
  }

  private resetPage(): void {
    this.pageState.update((state) => ({ ...state, pageIndex: 0 }));
  }

  private clampPage(): void {
    const { pageIndex, pageSize } = this.pageState();
    const pageCount = Math.max(1, Math.ceil(this.filtered().length / pageSize));

    if (pageIndex >= pageCount) {
      this.pageState.set({ pageIndex: pageCount - 1, pageSize });
    }
  }

  private showError(error: unknown, fallback: string): void {
    this.snackBar.open(apiErrorMessage(error, fallback), 'Dismiss', { duration: 6000 });
  }
}
