import { Injectable } from '@nestjs/common';

interface Task {
  id: number;
  user: string;
  description: string;
  status: 'pendiente' | 'en progreso' | 'finalizada';
}

@Injectable()
export class TaskService {
  private tasks: Task[] = [];
  private taskCounter = 1;

  addTask(
    user: string,
    description: string,
    status: 'pendiente' | 'en progreso' = 'pendiente',
  ): Task {
    const task: Task = { id: this.taskCounter++, user, description, status };
    this.tasks.push(task);
    return task;
  }

  getTasks(user: string): Task[] {
    return this.tasks.filter((task) => task.user === user);
  }

  updateTaskStatus(
    user: string,
    taskId: number,
    newStatus: 'pendiente' | 'en progreso' | 'finalizada',
  ): Task | null {
    const task = this.tasks.find(
      (task) => task.user === user && task.id === taskId,
    );
    if (task && task.status !== 'finalizada') {
      task.status = newStatus;
      return task;
    }
    return null;
  }

  finishCurrentTask(user: string): Task | null {
    const taskInProgress = this.tasks.find(
      (task) => task.user === user && task.status === 'en progreso',
    );
    if (taskInProgress) {
      taskInProgress.status = 'finalizada';
      return taskInProgress;
    }
    return null;
  }

  setNewTaskInProgress(user: string, newTaskId: number) {
    const currentTask = this.tasks.find(
      (task) => task.user === user && task.status === 'en progreso',
    );
    if (currentTask) {
      currentTask.status = 'pendiente';
    }

    const newTask = this.tasks.find(
      (task) => task.user === user && task.id === newTaskId,
    );
    if (newTask && newTask.status !== 'finalizada') {
      newTask.status = 'en progreso';
    }
  }
}
