export interface User {
  id: number;
  username: string;
  name: string;
}

export interface Task {
  name: string;
  slug: string;
  description?: string;
  completed: boolean;
  due_date: string;
}

export interface CreateTaskInput {
  name: string;
  slug: string;
  description?: string;
  completed: boolean;
  due_date: string;
}

export interface UpdateTaskInput {
  name: string;
  slug: string;
  description: string | null;
  completed: boolean;
  due_date: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  name: string;
  password: string;
}

export interface ValidationSample {
  name: string;
  email: string;
  password: string;
}

export interface ApiError {
  code: number;
  message: string;
  path?: Array<string | number>;
}

export interface ApiFailure {
  success: false;
  errors: ApiError[];
}

export interface AuthResponse {
  success: boolean;
  user: User;
}

export interface TaskListResponse {
  success: boolean;
  tasks: Task[];
}

export interface TaskResponse {
  success: boolean;
  task: Task;
}

export interface ValidationResponse {
  success: boolean;
  data: ValidationSample;
}

export type TaskStatus = 'completed' | 'pending' | 'overdue';

export interface TaskView extends Task {
  dueLabel: string;
  status: TaskStatus;
  overdue: boolean;
}
