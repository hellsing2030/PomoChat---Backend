import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskService } from '../TaskService.service';
import { Task, TaskSchema } from 'src/twitch/schema/tasks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  providers: [TaskService],
  exports: [TaskService],
})
export class TasksModule {}
