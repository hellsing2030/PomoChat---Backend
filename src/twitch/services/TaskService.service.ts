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
  private userTaskCounters: Record<string, number> = {};

  addTask(
    user: string,
    description: string,
    status: 'pendiente' | 'en progreso' = 'pendiente',
  ): Task {
    if (!this.userTaskCounters[user]) {
      this.userTaskCounters[user] = 1;
    }

    const task: Task = {
      id: this.userTaskCounters[user]++,
      user,
      description,
      status,
    };
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

  resetPreviousTask(user: string): void {
    this.tasks.forEach((task) => {
      if (task.user === user && task.status === 'en progreso') {
        task.status = 'pendiente';
      }
    });
  }

  deleteFinishedTasks(user: string): void {
    console.log(user, this.tasks);
    this.tasks = this.tasks.filter(
      (task) => task.user !== user || task.status !== 'finalizada',
    );
  }

  deleteTask(user: string, taskId: number): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(
      (task) => !(task.user === user && task.id === taskId),
    );
    return this.tasks.length < initialLength;
  }
}
