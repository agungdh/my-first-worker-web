import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { TaskService } from '../../../core/services/task.service';
import { todayIso } from '../../../core/util/date';
import { TaskFormDialog, type TaskFormDialogData } from './task-form-dialog';

describe('TaskFormDialog', () => {
  const today = todayIso();
  const created = {
    name: 'Write docs',
    slug: 'write-docs',
    description: undefined,
    completed: false,
    due_date: today,
  };

  const tasksService = {
    create: vi.fn(() => of(created)),
    update: vi.fn(() => of(created)),
  };
  const dialogRef = { close: vi.fn() };

  async function setup(data: TaskFormDialogData = {}) {
    await TestBed.configureTestingModule({
      imports: [TaskFormDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: TaskService, useValue: tasksService },
      ],
    }).compileComponents();

    return TestBed.createComponent(TaskFormDialog);
  }

  beforeEach(() => {
    tasksService.create.mockClear();
    tasksService.update.mockClear();
    dialogRef.close.mockClear();
  });

  it('creates a task from the filled form', async () => {
    const fixture = await setup();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const [name, slug] = Array.from(element.querySelectorAll('input')) as HTMLInputElement[];

    name.value = 'Write docs';
    name.dispatchEvent(new Event('input'));
    slug.value = 'write-docs';
    slug.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const form = element.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(tasksService.create).toHaveBeenCalledWith({
      name: 'Write docs',
      slug: 'write-docs',
      completed: false,
      due_date: today,
    });
    expect(dialogRef.close).toHaveBeenCalledWith(created);
  });

  it('updates an existing task including the checkbox state', async () => {
    const existing = {
      name: 'Write docs',
      slug: 'write-docs',
      description: 'Draft the guide',
      completed: false,
      due_date: today,
    };

    const fixture = await setup({ task: existing });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const checkbox = element.querySelector('mat-checkbox input') as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const form = element.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(tasksService.update).toHaveBeenCalledWith('write-docs', {
      name: 'Write docs',
      slug: 'write-docs',
      description: 'Draft the guide',
      completed: true,
      due_date: today,
    });
  });
});
