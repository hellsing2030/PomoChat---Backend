import { Module } from '@nestjs/common';
import { TwitchService } from './services/twitch.service';
import { CommandHandler } from './components/command.handler';
import { TasksModule } from 'src/task/task.module';

@Module({
  imports: [TasksModule],
  providers: [TwitchService, CommandHandler],
})
export class TwitchModule {}
