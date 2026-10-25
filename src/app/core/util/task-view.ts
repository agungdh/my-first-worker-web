import type { Task, TaskView } from '../models/api.models';
import { formatDueDate, isOverdue } from './date';

export function toTaskView(task: Task): TaskView {
  const overdue = !task.completed && isOverdue(task.due_date);

  return {
    ...task,
    dueLabel: formatDueDate(task.due_date),
    overdue,
    status: task.completed ? 'completed' : overdue ? 'overdue' : 'pending',
  };
}
