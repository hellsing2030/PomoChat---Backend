import { Module } from '@nestjs/common';
import { TwitchService } from './services/twitch.service';
import { CommandHandler } from './components/command.handler';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schema/tasks.schema';
import { TasksModule } from 'src/task/services/task.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    TasksModule,
  ],
  providers: [TwitchService, CommandHandler],
})
export class TwitchModule {}
