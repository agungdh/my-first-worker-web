import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { CreateTaskInput, Task } from '../../../core/models/api.models';
import { TaskService } from '../../../core/services/task.service';
import { todayIso } from '../../../core/util/date';
import { taskFormSchema, type TaskFormModel } from '../../../core/validation/form-schemas';

export interface TaskFormDialogData {
  task?: Task;
}

@Component({
  selector: 'app-task-form-dialog',
  imports: [
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
})
export class TaskFormDialog {
  readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog, Task>);
  private readonly tasksService = inject(TaskService);

  readonly isEdit = !!this.data.task;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly model = signal<TaskFormModel>({
    name: this.data.task?.name ?? '',
    slug: this.data.task?.slug ?? '',
    description: this.data.task?.description ?? '',
    due_date: this.data.task?.due_date ?? todayIso(),
    completed: this.data.task?.completed ?? false,
  });

  readonly form = form(this.model, taskFormSchema);

  save(event: Event): void {
    event.preventDefault();

    if (this.saving()) return;

    const formState = this.form();
    if (formState.invalid()) {
      formState.markAsTouched();
      return;
    }

    const value = formState.value();
    const name = value.name.trim();
    const slug = value.slug.trim().toLowerCase();
    const description = value.description.trim();

    this.saving.set(true);
    this.errorMessage.set(null);

    if (this.data.task) {
      this.tasksService
        .update(this.data.task.slug, {
          name,
          slug,
          description: description || null,
          completed: value.completed,
          due_date: value.due_date,
        })
        .subscribe({
          next: (task) => this.dialogRef.close(task),
          error: (error: unknown) => this.fail(error, 'Could not update the task.'),
        });

      return;
    }

    const input: CreateTaskInput = {
      name,
      slug,
      ...(description ? { description } : {}),
      completed: value.completed,
      due_date: value.due_date,
    };

    this.tasksService.create(input).subscribe({
      next: (task) => this.dialogRef.close(task),
      error: (error: unknown) => this.fail(error, 'Could not create the task.'),
    });
  }

  private fail(error: unknown, fallback: string): void {
    this.saving.set(false);
    this.errorMessage.set(apiErrorMessage(error, fallback));
  }
}
