import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { EMPTY, expand, map, type Observable, reduce } from 'rxjs';
import type {
  CreateTaskInput,
  Task,
  TaskListResponse,
  TaskResponse,
  UpdateTaskInput,
} from '../models/api.models';
import { API_BASE_URL } from '../config/api.config';

const PAGE_SIZE = 20;
const MAX_PAGES = 50;

@Service()
export class TaskService {
  private readonly http = inject(HttpClient);

  listPage(page: number, isCompleted?: boolean): Observable<Task[]> {
    let params = new HttpParams().set('page', page.toString());
    if (isCompleted !== undefined) {
      params = params.set('isCompleted', isCompleted.toString());
    }

    return this.http
      .get<TaskListResponse>(`${API_BASE_URL}/tasks`, { params })
      .pipe(map((response) => response.tasks ?? []));
  }

  listAll(isCompleted?: boolean): Observable<Task[]> {
    const fetchPage = (page: number): Observable<Task[]> =>
      this.listPage(page, isCompleted).pipe(
        expand((tasks) =>
          page + 1 < MAX_PAGES && tasks.length === PAGE_SIZE ? fetchPage(page + 1) : EMPTY,
        ),
      );

    return fetchPage(0).pipe(reduce((all, page) => [...all, ...page], [] as Task[]));
  }

  getBySlug(slug: string): Observable<Task> {
    return this.http
      .get<TaskResponse>(`${API_BASE_URL}/tasks/${encodeURIComponent(slug)}`)
      .pipe(map((response) => response.task));
  }

  create(input: CreateTaskInput): Observable<Task> {
    return this.http
      .post<TaskResponse>(`${API_BASE_URL}/tasks`, input)
      .pipe(map((response) => response.task));
  }

  update(slug: string, input: UpdateTaskInput): Observable<Task> {
    return this.http
      .put<TaskResponse>(`${API_BASE_URL}/tasks/${encodeURIComponent(slug)}`, input)
      .pipe(map((response) => response.task));
  }

  delete(slug: string): Observable<Task> {
    return this.http
      .delete<TaskResponse>(`${API_BASE_URL}/tasks/${encodeURIComponent(slug)}`)
      .pipe(map((response) => response.task));
  }

  toggleCompleted(task: Task): Observable<Task> {
    return this.update(task.slug, {
      name: task.name,
      slug: task.slug,
      description: task.description ?? null,
      completed: !task.completed,
      due_date: task.due_date,
    });
  }
}
