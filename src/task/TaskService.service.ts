import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from 'src/twitch/schema/tasks.schema';

interface TaskProps {
  id_tasks: number;
  user: string;
  description: string;
  status: 'pendiente' | 'en progreso' | 'finalizada';
}

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async addTask(
    user: string,
    description: string,
    status: string = 'pendiente',
  ): Promise<Task> {
    const lastTask = await this.taskModel
      .findOne({ user })
      .sort({ id_tasks: -1 })
      .exec();

    const nextId = lastTask ? lastTask.id_tasks + 1 : 0;

    const newTask = new this.taskModel({
      id_tasks: nextId,
      user,
      description,
      status,
    });

    return newTask.save();
  }

  async getTasks(user: string): Promise<TaskProps[]> {
    return this.taskModel.find({ user }).exec();
  }

  async updateTaskStatus(
    user: string,
    taskId: string,
    newStatus: 'pendiente' | 'en progreso' | 'finalizada',
  ): Promise<Task | null> {
    return await this.taskModel
      .findOneAndUpdate(
        { _id: taskId, user },
        { status: newStatus },
        { new: true },
      )
      .exec();
  }

  async finishCurrentTask(user: string): Promise<TaskProps | null> {
    return this.taskModel
      .findOneAndUpdate(
        { user, status: 'en progreso' },
        { status: 'finalizada' },
        { new: true },
      )
      .exec();
  }

  async resetPreviousTask(user: string): Promise<void> {
    await this.taskModel
      .updateMany({ user, status: 'en progreso' }, { status: 'pendiente' })
      .exec();
  }

  async deleteFinishedTasks(user: string): Promise<void> {
    await this.taskModel.deleteMany({ user, status: 'finalizada' }).exec();
  }

  async deleteTask(user: string, taskId: string): Promise<boolean> {
    const result = await this.taskModel.deleteOne({ _id: taskId, user }).exec();
    return result.deletedCount > 0;
  }
}
